const config = require('config')
const express = require('express')
require('express-async-errors')
const helmet = require('helmet')
const morgan = require('morgan')
const { error } = require('./middleware')
const fs = require('fs')
uncaughtDebug = require('debug')('app:Uncaught')

require('./db/mongoose')

//Imports routes
const deviceRouter = require('./routes/devices')
const streamRouter = require('./routes/streams')
const subscriptionsRouter = require('./routes/subscriptions')
const expressDebug = require('debug')('app:express')

//Uses the express framework
const app = express()

//Uses specified port in env variable. Uses port 8002 as if none is given
const port = process.env.PORT || 8001

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
app.use('/czb/subscriptions', subscriptionsRouter)

// error middleware
//app.use(error)

app.listen(port, () => {
    expressDebug(`Data Layer is up & running @ port ${port}`)
})
