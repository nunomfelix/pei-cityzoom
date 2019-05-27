//Debug
const config = require('config')
const colors = require('colors')
const mqtt = require('mqtt')
const consumerDebug = require('debug')('app:Consumer')
//Broker connection
const client = mqtt.connect('mqtt://'+config.get('BROKER_HOST')+':'+config.get('BROKER_PORT'),{clientId: 'cityzoom_consumer'})
const rootTopic = config.get('BROKER_ROOT_TOPIC')
//Connection to MongoDB
require('./db/mongoose') 
const Device = require('./db/models/devices')
const Stream = require('./db/models/streams')
const Value = require('./db/models/values')

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
        await Stream.create(data_json)
            .then(() => {
                consumerDebug('Stream created with success')
            }).catch(()=>{
                consumerDebug('Error publishing stream')
            })
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
        //Saves the value in the database
        Value.create(data_json).then(()=>{
            consumerDebug('Values published in the database')
        }).catch(()=>{
            consumerDebug('Error publishing value in the database')
        })

    }
})