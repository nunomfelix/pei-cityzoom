const config = require('config')
const express = require('express')
require('express-async-errors')
const helmet = require('helmet')
const morgan = require('morgan')
const { error } = require('./middleware')
const fs = require('fs')
const axios = require('axios')
const User = require('./db/models/user')
uncaughtDebug = require('debug')('app:Uncaught')

require('./db/mongoose')

//Imports routes
const mobileappRouter = require('../../gateway_layer/src/mobileapp/mobileapp')
const accountRouter = require('./routes/user')
const alertRouter = require('./routes/alert')
const streamRouter = require('./routes/stream')
const deviceRouter = require('./routes/device')
const verticalRouter = require('./routes/vertical')
const valuesRouter = require('./routes/values')
const expressDebug = require('debug')('app:express')

//Uses the express framework
const app = express()

//Uses specified port in env variable. Uses port 8002 as if none is given
const port = process.env.PORT || 8002

//Fica a ouvir excessoes ou promessas globais que nao sao apanhadas e da log para o ficheiro uncaught
process.on('uncaughtException', (ex) => {
    fs.appendFileSync('uncaught.log', new Date().toISOString() + " - uncaughtException - " + ex + '\n');
    uncaughtDebug(ex)
})
process.on('unhandledRejection', (ex) => {
    fs.appendFileSync('uncaught.log', new Date().toISOString() + " - unhandledRejection - " + ex + '\n');
    uncaughtDebug(ex)
})

app.use((req, res, next) => {
    var allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://localhost:3000',];
    var origin = req.headers.origin;
    // if (allowedOrigins.indexOf(origin) > -1) {
    //     res.setHeader('Access-Control-Allow-Origin', origin);
    // }
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

app.get('/reset', async (req, res) => {
    await User.deleteMany({})
    const user = await axios({
        method: 'post',
        url: 'http://localhost:8002/user',
        data: {
            name: 'teste',
            username: 'teste',
            email: 'teste@gmail.com',
            password: 'teste'
        }
    })
    res.send(user.data)
})

app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())

//Sets up all routes
app.use('/user', accountRouter)
app.use('/alerts', alertRouter)
app.use('/streams', streamRouter)
app.use('/devices', deviceRouter)
app.use('/vertical', verticalRouter)
app.use('/mobileapp', mobileappRouter)
app.use('/values', valuesRouter)

//Error middleware, para excessoes causadas em funcoes assincronas do express
app.use(error)

app.listen(port, () => {
    expressDebug('Service Layer up on port ' + port)
})
