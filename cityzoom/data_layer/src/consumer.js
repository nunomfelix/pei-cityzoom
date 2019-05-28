//Debug
const config = require('config')
const colors = require('colors')
const mqtt = require('mqtt')
const turf = require('@turf/helpers')
const booleanPointInPolygon = require('@turf/boolean-point-in-polygon').default
const consumerDebug = require('debug')('app:Consumer')
//Broker connection
const client = mqtt.connect('mqtt://'+config.get('BROKER_HOST')+':'+config.get('BROKER_PORT'),{clientId: 'cityzoom_consumer'})
const rootTopic = config.get('BROKER_ROOT_TOPIC')
//Connection to MongoDB
require('./db/mongoose') 
const Device = require('./db/models/devices')
const Stream = require('./db/models/streams')
const Hexas = require('./db/models/hexagons')
const Muns = require('./db/models/municipalities')
const Values = require('./db/models/values')

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
    consumerDebug('New value coming in for topic',colors.blue(topic))
    let data_json = JSON.parse(data.toString())
    //If a new device was added
    if(topic==rootTopic+'devices'){
        await Device.create(data_json)
            .then(() => {
                consumerDebug('Device created with success')
            })
            .catch(() => {
                consumerDebug(`Error publishing device`)
            })
    }//If a new stream was added
    else if(topic == rootTopic+'streams'){
        try {
            const res = await Stream.create(data_json)
            consumerDebug('Stream created with success')
        } catch(e) {
            consumerDebug('Error publishing stream')
        }
    }else if(topic == rootTopic+'values'){
        const stream = await Stream.findOne({stream_ID:data_json.stream_ID})
        let dev = await Device.findOne({device_ID:stream.device_ID}) 
        if (dev.mobile || ( !dev.mobile && dev.locations.length == 0)) {
            await Device.updateOne({device_ID:stream.device_ID}, {$push: {locations: {timestamp: data_json.timestamp, latitude: data_json.latitude, longitude: data_json.longitude}}})
            .then(()=>{
                consumerDebug(`Updated the location of device ${stream.device_ID}`)
            }).catch(()=>{
                consumerDebug(`Error updating the location of device ${stream.device_ID}`)
            })
        }

        // hexagons stuff
        var hexa = !dev.mobile && dev.hexagon ? await Hexas.findOne({id: dev.hexagon}) : null

        if(!hexa) {
            const hexagons = await Hexas.find()
            var a = turf.point([data_json.longitude, data_json.latitude])
            for (hexagon of hexagons) {
                var b = turf.polygon([hexagon.coordinates])
                if (booleanPointInPolygon(a, b)) {
                    hexa = hexagon
                    break;
                }
            }
        }

        // hexagon streams
        if(!hexa.streams || (!(stream.stream_name in hexa.streams))) {
            hexa.streams = {
                ...(hexa.streams || {}),
                [stream.stream_name]: {
                    max: data_json.value,
                    min: data_json.value,
                    average: data_json.value,
                    count: 1
                }
            }
        } else {
            hexa.streams = {
                ...hexa.streams,
                [stream.stream_name]: {
                    max: data_json.value > hexa.streams[stream.stream_name].max ? data_json : hexa.streams[stream.stream_name].max,
                    min: data_json.value < hexa.streams[stream.stream_name].min ? data_json : hexa.streams[stream.stream_name].min,
                    average: (hexa.streams[stream.stream_name].average * hexa.streams[stream.stream_name].count + data_json.value) / (hexa.streams[stream.stream_name].count + 1),
                    count: hexa.streams[stream.stream_name].count + 1
                }
            }
        }
        
        // municipalities streams
        var mun = await Muns.findOne({id: hexa.municipality})
    
        if(!mun.streams || (!(stream.stream_name in mun.streams))) {
            mun.streams = {
                ...(mun.streams || {}),
                [stream.stream_name]: {
                    max: data_json.value,
                    min: data_json.value,
                    average: data_json.value,
                    count: 1
                }
            }
        } else {
            mun.streams = {
                ...mun.streams,
                [stream.stream_name]: {
                    max: data_json.value > mun.streams[stream.stream_name].max ? data_json : mun.streams[stream.stream_name].max,
                    min: data_json.value < mun.streams[stream.stream_name].min ? data_json : mun.streams[stream.stream_name].min,
                    average: (mun.streams[stream.stream_name].average * mun.streams[stream.stream_name].count + data_json.value) / (mun.streams[stream.stream_name].count + 1),
                    count: mun.streams[stream.stream_name].count + 1
                }
            }
        }

        await Device.updateOne({device_ID: stream.device_ID}, {hexagon: hexa.id})
        await hexa.save()
        await mun.save()

        //Saves the value in the database
        Values.create(data_json).then(()=>{
            consumerDebug('Values published in the database')
        }).catch((err)=>{
            consumerDebug(err)
        })
    }
})