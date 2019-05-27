const mongoose = require('mongoose')
const fs = require('fs')
const verticals = require('./models/verticals')
const hexagons = require('./models/hexagons')
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
    fs.readFile('hex_data.json', async (err, data) => {
        await hexagons.deleteMany({})
        if (err) throw err;
        let hexas = JSON.parse(data)
        await hexagons.insertMany(hexas.map(h => 
            new hexagons({
                id: h.id,
                coordinates: h.coordinates,
                municipality: h.municipality,
                average: 0,
                values_til_now: 0
            })
        ))
    })
    mongooseDebug("Connected to mongo database!")
})