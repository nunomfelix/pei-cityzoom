const config = require('config')
const express = require('express')
require('express-async-errors')
const helmet = require('helmet')
const morgan = require('morgan')
const { error } = require('./middleware')
const fs = require('fs')
uncaughtDebug = require('debug')('app:Uncaught')
const expressDebug = require('debug')('app:express')

require('./db/mongoose')

//Imports routes
const deviceRouter = require('./routes/devices')
const streamRouter = require('./routes/streams')
const alertRouter = require('./routes/alerts')

//Uses the express framework
const app = express()

//Uses specified port in env variable. Uses port 8002 as if none is given
const port = process.env.PORT || 8001

app.use((req, res, next) => {
    var allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://193.136.93.14:3000',];
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

process.on('uncaughtException', (ex) => {
    fs.appendFileSync('uncaught.log', new Date().toISOString() + " - uncaughtException - " + ex + '\n');
    uncaughtDebug(ex)
})
process.on('unhandledRejection', (ex) => {
    fs.appendFileSync('uncaught.log', new Date().toISOString() + " - unhandledRejection - " + ex + '\n');
    uncaughtDebug(ex)
})

app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())

// Routes setup
app.use('/czb/devices', deviceRouter)
app.use('/czb/streams', streamRouter)
app.use('/czb/alerts', alertRouter)

// error middleware
//app.use(error)

app.listen(port, () => {
    expressDebug(`Data Layer is up & running @ port ${port}`)
})
