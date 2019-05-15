const mongoose = require('mongoose')
const fs = require('fs')
const Vertical = require('../db/models/vertical')

mongooseDebug = require('debug')('app:Mongoose')

const connectionURL = 'mongodb://127.0.0.1:27017/'
const databaseName = 'city_zoom_service_layer'

mongoose.connect(connectionURL + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true
}, () => {
    fs.readFile('verticals.json', async (err, data) => { 
        await Vertical.deleteMany({}) 
        if (err) throw err;
        let vertical = JSON.parse(data)
        for(var v in vertical.vertical) {
            const vert = new Vertical({
                name: v,
                display: vertical.vertical[v].display,
                streams: vertical.vertical[v].streams,
            })
            // console.log(vert)
            await vert.save()
        }
    })
    mongooseDebug("Connected to mongo database!")
})
