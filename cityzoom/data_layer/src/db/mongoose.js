const mongoose = require('mongoose')
const fs = require('fs')
const verticals = require('./models/verticals')
const hexagons = require('./models/hexagons')
const devices = require('./models/devices')
const streams = require('./models/streams')
const values = require('./models/values')
const muns = require('./models/municipalities')
const mongooseDebug = require('debug')('app:Mongoose')
const mutex = require('async-mutex').Mutex

const Mutex = new mutex()
const connectionUrl = 'mongodb://127.0.0.1:27017/'
const database = 'city_zoom_data_layer'

mongoose.connect(connectionUrl+database, {
    useNewUrlParser: true,
    useCreateIndex: true
}, async () => {

    fs.writeFile('data_teste' + (new Date().toLocaleString()), JSON.stringify({verticals: await verticals.find(), devices: await devices.find(), streams: await streams.find(), values: await values.find(), hexagons: await hexagons.find(), muns: await muns.find()}), () => {})
    
    Mutex.acquire().then(async (release) => {
    
        await hexagons.deleteMany({})
        await muns.deleteMany({})
        await devices.deleteMany({})
        await streams.deleteMany({})
        await values.deleteMany({})
        await verticals.deleteMany({})

        fs.readFile('backup', async(err, res) => {
            res = JSON.parse(res)
            console.log(Object.keys(res))
            if(res.hexagons)
                await hexagons.insertMany(res.hexagons.map(h => 
                    new hexagons(h)    
                ))
            if(res.muns)
                await muns.insertMany(res.muns.map(m => 
                    new muns(m)    
                ))
            if(res.verticals)
                await verticals.insertMany(res.verticals.map(v => 
                    new verticals(v)    
                ))
            if(res.devices)
                await devices.insertMany(res.devices.map(d => 
                    new devices(d)    
                ))
            if(res.values)
                await values.insertMany(res.values.map(v => 
                    new values(v)    
                ))
            if(res.streams)
                await streams.insertMany(res.streams.map(s => 
                    new streams(s)    
                ))
        })
        release()

        // fs.readFile('verticals.json', async (err, data) => { 
        //     await verticals.deleteMany({}) 
        //     if (err) throw err;
        //     let vertical = JSON.parse(data)
        //     const streams_array = []
        //     for(var v in vertical.vertical) {
        //         const vert = new verticals({
        //             name: v,
        //             display: vertical.vertical[v].display,
        //             streams: vertical.vertical[v].streams,
        //         })
        //         streams_array.push(...vertical.vertical[v].streams.map(s => s.name))
        //         // console.log(vert)
        //         await vert.save()
        //     }
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
        //})
    })
    mongooseDebug("Connected to mongo database!")
})