const mongoose = require('mongoose')
const express = require('express')
const { fetch } = require('./fetcher')
const config = require('config')
mongooseDebug = require('debug')('app:Mongoose')

// my modules
const parser = require('./parser')

const app = express()
app.use(express.json())

mongoose.connect('mongodb://localhost/city_zoom_data_layer')
    .then(() => {
        console.log('Connected to MongoDB...')
        fetch(config.get('FETCHING_PERIOD'))
    })
    .catch(() => console.log('Could not connect to MongoDB...'))

app.use('/czb/stream', parser.router)

const connectionURL = 'mongodb://127.0.0.1:27017/'
const databaseName = 'city_zoom_service_layer'

mongoose.connect(connectionURL + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true
}, () => mongooseDebug("Connected to mongo database!"))

app.listen(8001, () => {
    console.log('listen in port 8001')
})
