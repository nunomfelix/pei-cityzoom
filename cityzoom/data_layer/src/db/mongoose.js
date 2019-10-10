const mongoose = require('mongoose')
const fs = require('fs')
const verticals = require('./models/verticals')
const hexagons = require('./models/hexagons')
const devices = require('./models/devices')
const values = require('./models/values')
const satellite = require('./models/satellite')
const alerts = require('./models/alerts')
const muns = require('./models/municipalities')
const mongooseDebug = require('debug')('app:Mongoose')
const connectionUrl = 'mongodb://127.0.0.1:27017/'
const database = 'city_zoom_data_layer'

mongoose.connect(connectionUrl+database, {
    useNewUrlParser: true,
    useCreateIndex: true
}, async () => {

    await verticals.deleteMany({})
    fs.readFile('verticals.json', async(err, res) => {
        res = JSON.parse(res)
        for(var vertical in res.vertical) {
            await verticals.create({
                ...res.vertical[vertical],
                name: vertical
            })
        }
    })

    fs.writeFile('backup', JSON.stringify({satellite: await satellite.find(), alerts: await alerts.find(), devices: await devices.find(), values: await values.find(), hexagons: await hexagons.find(), muns: await muns.find()}), () => {})
    
    await hexagons.deleteMany({})
    await muns.deleteMany({})
    await devices.deleteMany({})
    await values.deleteMany({})
    await satellite.deleteMany({})
    await alerts.deleteMany({})

    fs.readFile('backup', async(err, res) => {
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
        if(res.satellite) {
            await satellite.insertMany(res.satellite.map(v => 
                new satellite(v)    
            ))
            mongooseDebug("Loaded satellite")
        }
        if(res.alerts) {
            await alerts.insertMany(res.alerts.map(a => 
                new alerts(a)    
            ))
            mongooseDebug("Loaded alerts")
        }
    })
    
    mongooseDebug("Connected to mongo database!")
})