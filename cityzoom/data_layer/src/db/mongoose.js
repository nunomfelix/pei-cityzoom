const mongoose = require('mongoose')
const fs = require('fs')
const verticals = require('./models/verticals')
const mongooseDebug = require('debug')('app:Mongoose')

const connectionUrl = 'mongodb://127.0.0.1:27017/'
const database = 'city_zoom_data_layer'

mongoose.connect(connectionUrl+database, {
    useNewUrlParser: true,
    useCreateIndex: true
}, () => {
    fs.readFile('verticals.json', async (err, data) => { 
        await verticals.deleteMany({}) 
        if (err) throw err;
        let vertical = JSON.parse(data)
        for(var v in vertical.vertical) {
            const vert = new verticals({
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