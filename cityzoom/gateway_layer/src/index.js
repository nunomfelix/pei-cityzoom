const config = require('config')
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const {error} = require('../../service_layer/src/middleware')
const expressDebug = require('debug')('app:express')

//Imports routes
const mobileappRouter = require('./mobileapp/mobileapp')

//Uses the express framework
const app = express()

//Uses specified port in env variable. Uses port 8003 as if none is given
const port = process.env.PORT || 8003

app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())

// Routes setup
app.use('/mobileapp', mobileappRouter)
app.use(error)

app.listen(port, () => {
    expressDebug(`Gateway Layer is up & running @ port ${port}`)
})
