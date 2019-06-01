const mongoose = require('mongoose')
const connectionUrl = 'mongodb://127.0.0.1:27017/'
const database = 'city_zoom_data_layer'
const mongooseDebug = require('debug')('app:Mongoose')

mongoose.connect(connectionUrl+database, {
    useNewUrlParser: true,
    useCreateIndex: true
}, async () => {
    mongooseDebug("Connected to mongo database!")
})