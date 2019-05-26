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
const Subscription = require('./db/models/subscriptions')

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
    }//If a new subscription was added
    else if(topic == rootTopic+'subscriptions'){
        await Subscription.create(data_json)
            .then(() => {
                consumerDebug('Subscription created with success')
            }).catch(()=>{
                consumerDebug('Error publishing subscription')
            })
    }
})