const config = require('config')
const express = require('express')
require('express-async-errors')
const helmet = require('helmet')
const morgan = require('morgan')
const { error } = require('./middleware')

uncaughtDebug = require('debug')('app:Uncaught')

require('./db/mongoose')

//Imports routes
const accountRouter = require('./routes/user')
const alertRouter = require('./routes/alert')
const streamRouter = require('./routes/stream')
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

app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())

//Sets up all routes
app.use('/user', accountRouter)
app.use('/alert', alertRouter)
app.use('/stream', streamRouter)

//Error middleware, para excessoes causadas em funcoes assincronas do express
app.use(error)

app.listen(port, () => {
    expressDebug('Service Layer up on port ' + port)
})