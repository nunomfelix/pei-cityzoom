const mongoose = require('mongoose')
const fs = require('fs')
const verticals = require('./models/verticals')
const hexagons = require('./models/hexagons')
const devices = require('./models/devices')
const streams = require('./models/streams')
const values = require('./models/values')
const alerts = require('./models/alerts')
const muns = require('./models/municipalities')
const mongooseDebug = require('debug')('app:Mongoose')
const connectionUrl = 'mongodb://127.0.0.1:27017/'
const database = 'city_zoom_data_layer'

mongoose.connect(connectionUrl+database, {
    useNewUrlParser: true,
    useCreateIndex: true
}, async () => {

    //fs.writeFile('data_teste' + new Date(), JSON.stringify({alerts: await alerts.find(), verticals: await verticals.find(), devices: await devices.find(), streams: await streams.find(), values: await values.find(), hexagons: await hexagons.find(), muns: await muns.find()}), () => {})
    
    await hexagons.deleteMany({})
    await muns.deleteMany({})
    await devices.deleteMany({})
    await streams.deleteMany({})
    await values.deleteMany({})
    await verticals.deleteMany({})
    await alerts.deleteMany({})

    fs.readFile('backup_start_main', async(err, res) => {
        res = JSON.parse(res)
        mongooseDebug("Starting up")
        if(res.hexagons) {
            await hexagons.insertMany(res.hexagons.map(h => 
                new hexagons(h)    
            ))
            mongooseDebug("Loaded hexagons")
        }
        if(res.muns) {
            await muns.insertMany(res.muns.map(m => 
                new muns(m)    
            ))
            mongooseDebug("Loaded municipalities")
        }
        if(res.verticals) {
            await verticals.insertMany(res.verticals.map(v => 
                new verticals(v)    
            ))
            mongooseDebug("Loaded verticals")
        }
        if(res.devices) {
            await devices.insertMany(res.devices.map(d => 
                new devices(d)    
            ))
            mongooseDebug("Loaded devices")
        }
        if(res.values) {
            await values.insertMany(res.values.map(v => 
                new values(v)    
            ))
            mongooseDebug("Loaded values")
        }
        if(res.streams) {
            await streams.insertMany(res.streams.map(s => 
                new streams(s)    
            ))
            mongooseDebug("Loaded streams")
        }
        if(res.alerts) {
            await alerts.insertMany(res.alerts.map(a => 
                new alerts(a)    
            ))
            mongooseDebug("Loaded alerts")
        }
    })

    //     // fs.readFile('alerts.json', async (err, data) => {
    //     //    await alerts.deleteMany({})
    //     //    let alert = JSON.parse(data)
    //     //    alert.alerts.forEach(async (value) => {
    //     //        const alt = new alerts(value)
    //     //        await alt.save()
    //     //    })
    //     //    for (var a in alert.alerts) {
               
    //     //    }
    //     // })
    //     // fs.readFile('verticals.json', async (err, data) => { 
    //     //     await verticals.deleteMany({}) 
    //     //     if (err) throw err;
    //     //     let vertical = JSON.parse(data)
    //     //     const streams_array = []
    //     //     for(var v in vertical.vertical) {
    //     //         const vert = new verticals({
    //     //             name: v,
    //     //             display: vertical.vertical[v].display,
    //     //             streams: vertical.vertical[v].streams,
    //     //         })
    //     //         await vert.save()
    //     //     }
    //     // })

        
        //     // fs.readFile('hex_data.json', async (err, hexa_json) => {
        //     //     if (err) throw err;
        //     //     let hexas = JSON.parse(hexa_json)
        //     //     const municipalities = new Set()
        //     //     await hexagons.insertMany(hexas.map(h => {
        //     //         municipalities.add(h.municipality)
        //     //         return new hexagons({
        //     //             id: h.id,
        //     //             coordinates: h.coordinates,
        //     //             municipality: h.municipality,
        //     //             streams: {}
        //     //         })
        //     //     }))
        //     //     await muns.insertMany([...municipalities].map(m =>
        //     //         new muns({
        //     //             id: m,
        //     //             streams: {}
        //     //         })
        //     //     ))
        //     // })
    mongooseDebug("Connected to mongo database!")
})