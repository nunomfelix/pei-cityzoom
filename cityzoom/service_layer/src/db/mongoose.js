const mongoose = require('mongoose')
mongooseDebug = require('debug')('app:Mongoose')

const connectionURL = 'mongodb://127.0.0.1:27017/'
const databaseName = 'city_zoom_service_layer'

mongoose.connect(connectionURL + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true
}, () => mongooseDebug("Connected to mongo database!"))
