//Debug
const config = require('config')
const colors = require('colors')
const mongoose = require('mongoose')
const mqtt = require('mqtt')
const turf = require('@turf/helpers')
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default
const consumerDebug = require('debug')('app:Consumer')
//Broker connection
const client = mqtt.connect('mqtt://'+config.get('BROKER_HOST')+':'+config.get('BROKER_PORT'),{clientId: 'cityzoom_consumer'})
const rootTopic = config.get('BROKER_ROOT_TOPIC')
//Connection to MongoDB
require('./db/mongoose_consumer') 
const Device = require('./db/models/devices')
const Verticals = require('./db/models/verticals')
const Hexas = require('./db/models/hexagons')
const Muns = require('./db/models/municipalities')
const Satellites = require('./db/models/satellite')
const Values = require('./db/models/values')
const Alerts = require('./db/models/alerts')
const Triggers = require('./db/models/triggers')

client.on('connect',()=>{
    consumerDebug('Listening to MQTT broker!')
    const opt = {
        qos: 0
    }
    client.subscribe(rootTopic+'+',opt,()=>{
        consumerDebug('Subscribed to topic',colors.blue(rootTopic))
    })
})
    
client.on('message',async (topic,data,info)=>{
    const data_json = JSON.parse(data)
    if (topic==rootTopic+'devices') {
        Device.create(data_json)
            .then(() => {
                consumerDebug('Device created with success')
            })
            .catch(() => {
                consumerDebug(`Error publishing device`)
            })
    } else if (topic == rootTopic+'values') {
        await updateValues(data_json)
    } else if (topic == rootTopic+'alerts') {
        Alerts.create(data_json).then( () => {
            consumerDebug('Alert created with success')
        }).catch(()=> {
            consumerDebug('Error publiching Alert')
        })
    }
    
})

async function updateValues(data_json) {

    const {longitude, latitude, ...rest} = data_json

    const hexa = await Hexas.findOne({
        location: {
            $geoIntersects: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            }
        }
    })

    if(data_json.satellite) {
        if(hexa) {
            Satellites.create({
                ...rest,
                hexagon: hexa.id,
                municipality: hexa.municipality
            })
        }
    } else {
        Values.create({
            ...rest,
            hexagon: hexa ? hexa.id : null,
            municipality: hexa ? hexa.municipality : null,
            latitude,
            longitude
        })
    
        Device.updateOne({device_ID: data_json.device_ID}, {
            $set: {
                location: [
                    longitude,
                    latitude
                ]
            },
            $addToSet: {
                verticals: (await Verticals.findOne({"streams.name": data_json.stream_name})).name,
                streams: data_json.stream_name,
            }
        })
    }
    consumerDebug('[DEBUG] Checking alerts')
    if (hexa != null) {
        alert_checker(data_json.stream_name, hexa.id, hexa.municipality, data_json.satellite)
    }
}