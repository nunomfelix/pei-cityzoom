const config = require('config')
const colors = require('colors')
const mqtt = require('mqtt')
const prodDebug = require('debug')('app:Producer')
const client = mqtt.connect('mqtt://'+config.get('BROKER_HOST')+':'+config.get('BROKER_PORT'),{clientId: 'cityzoom_producer'})
const rootTopic = config.get('BROKER_ROOT_TOPIC')
//MongoDB
const Device = require('./db/models/devices')
const Stream = require('./db/models/streams')
const Value = require('./db/models/values')

/*
    returns:
        true - if the device was published
        false - otherwise
*/
async function publish(topic,msg)  {
    var opt = {
        qos: 0, //QoS level, Number, default 0
        retain: false, //retain flag, Boolean, default false
        dup: false //mark as duplicate flag, Boolean, default false
    }
    let result = false
    //Publishing a new device
    if(topic == rootTopic+'devices'){
        result = await Device.findOne({device_ID:msg.device_ID})
        if(result){
            prodDebug('Device',msg.device_ID,'already exists!')
            return false
        }
        await client.publish(topic,JSON.stringify(msg),opt,(err,data)=>{
            prodDebug('Published new device into topic',colors.blue(topic))
        })
    }else if(topic == rootTopic+'streams'){
        result = await Stream.findOne({stream_ID:msg.stream_ID})
        if(result){
            prodDebug('Stream',msg.stream_ID,'already exists!')
            return false
        }
        await client.publish(topic,JSON.stringify(msg),opt,(err,data)=>{
            prodDebug('Published new stream into topic',colors.blue(topic))
        })
    }else if(topic == rootTopic+'values'){
        const stream = await Stream.findOne({stream_ID:msg.stream_ID})
        if(stream) {
            await client.publish(topic,JSON.stringify({...msg, stream}),opt)
            prodDebug('Published new value into topic',colors.blue())
        }
    }
    return true
}

client.on('connect',()=>{
    prodDebug('Connected to MQTT broker!')
})

module.exports = {
    publish
}