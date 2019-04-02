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

mongoose.connect('mongodb://localhost/city_zoom_data_layer', )
    .then(()=> console.log('Connected to MongoDB...'))
    .catch(()=> console.log('Could not connect to MongoDB...'))

// var Person = mongoose.model('User', {});
// Person.find().then(v => {
//     console.log(v)
// })
app.use('/czb/stream', parser)
<<<<<<< HEAD

const connectionURL = 'mongodb://127.0.0.1:27017/'
const databaseName = 'city_zoom_service_layer'

mongoose.connect(connectionURL + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true
}, () => mongooseDebug("Connected to mongo database!"))

app.listen(8001, () => { console.log('listen in port 8001') })
=======
app.listen(8001, () => { console.log('listen in port 8001') })

>>>>>>> lucas
