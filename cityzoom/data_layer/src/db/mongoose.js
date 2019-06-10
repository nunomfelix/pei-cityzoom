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

    fs.writeFile('backup_main_', JSON.stringify({satellite: await satellite.find(), alerts: await alerts.find(), verticals: await verticals.find(), devices: await devices.find(), values: await values.find(), hexagons: await hexagons.find(), muns: await muns.find()}), () => {})
    
    //fs.writeFile('backup_main_asdf', JSON.stringify({alerts: await alerts.find()}), () => {})


    // await hexagons.deleteMany({})
    // await muns.deleteMany({})
    // await devices.deleteMany({})
    // await values.deleteMany({})
    // await satellite.deleteMany({})
    // await verticals.deleteMany({})
    // await alerts.deleteMany({})

    // fs.readFile('backup_main_asdf', async(err, res) => {
    //     res = JSON.parse(res)
    //     mongooseDebug("Starting up")
    //     if(res.hexagons) {
    //         await hexagons.insertMany(res.hexagons.map(h => 
    //             new hexagons(h)    
    //         ))
    //         mongooseDebug("Loaded hexagons")
    //     }
    //     if(res.muns) {
    //         await muns.insertMany(res.muns.map(m => 
    //             new muns(m)    
    //         ))
    //         mongooseDebug("Loaded municipalities")
    //     }
    //     if(res.verticals) {
    //         await verticals.insertMany(res.verticals.map(v => 
    //             new verticals(v)    
    //         ))
    //         mongooseDebug("Loaded verticals")
    //     }
    //     if(res.devices) {
    //         await devices.insertMany(res.devices.map(d => 
    //             new devices(d)    
    //         ))
    //         mongooseDebug("Loaded devices")
    //     }
    //     if(res.values) {
    //         await values.insertMany(res.values.map(v => 
    //             new values(v)    
    //         ))
    //         mongooseDebug("Loaded values")
    //     }
    //     if(res.satellite) {
    //         await satellite.insertMany(res.satellite.map(v => 
    //             new satellite(v)    
    //         ))
    //         mongooseDebug("Loaded satellite")
    //     }
    //     if(res.alerts) {
    //         await alerts.insertMany(res.alerts.map(a => 
    //             new alerts(a)    
    //         ))
    //         mongooseDebug("Loaded alerts")
    //     }
    // })
    
    mongooseDebug("Connected to mongo database!")
})