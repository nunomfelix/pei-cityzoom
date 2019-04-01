
const mongoose = require('mongoose')
const express = require('express')
mongooseDebug = require('debug')('app:Mongoose')

// my modules
const parser = require('./parser')
const producer = require('./kafka-producer')
const consumer = require('./kafka-producer')
const admin = require('./kafka-admin')

const app = express()

app.use(express.json())

app.use('/czb/stream', parser)

const connectionURL = 'mongodb://127.0.0.1:27017/'
const databaseName = 'city_zoom_service_layer'

mongoose.connect(connectionURL + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true
}, () => mongooseDebug("Connected to mongo database!"))

app.listen(8001, () => { console.log('listen in port 8001') })