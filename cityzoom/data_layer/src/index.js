const mongoose = require('mongoose')
const express = require('express')
const { fetch } = require('./fetcher')
const config = require('config')
mongooseDebug = require('debug')('app:Mongoose')

// my modules
const parser = require('./parser')

const app = express()
app.use(express.json())

mongoose.connect('mongodb://localhost/city_zoom_data_layer', {useNewUrlParser: true})
    .then(() => {
        console.log('Connected to MongoDB...')
        //fetch(config.get('FETCHING_PERIOD'))
    })
    .catch(() => console.log('Could not connect to MongoDB...'))

app.use('/czb/stream', parser.router)


app.listen(8001, () => {
    console.log('listen in port 8001')
})
