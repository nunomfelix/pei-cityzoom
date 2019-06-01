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
require('./db/mongoose_consumer') 
const Device = require('./db/models/devices')
const Stream = require('./db/models/streams')
const Hexas = require('./db/models/hexagons')
const Muns = require('./db/models/municipalities')
const Values = require('./db/models/values')
const Alerts = require('./db/models/alerts')
const Mutex = require('async-mutex').Mutex
let mutex = new Mutex()

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
    if(topic==rootTopic+'devices') {
        Device.create(data_json)
            .then(() => {
                consumerDebug('Device created with success')
            })
            .catch(() => {
                consumerDebug(`Error publishing device`)
            })
    } else if(topic == rootTopic+'streams') {
        Stream.create(data_json).then(() => {
            consumerDebug('Stream created with success')
        }).catch((e) => {
            consumerDebug('Error publishing stream')
        })
    } else if(topic == rootTopic+'values') {
        const {stream, ...rest} = data_json
        await updateValues(stream, rest)
    }
    
})

async function updateValues(stream, data_json) {

    //alert(stream, hexa)
    Values.create(data_json)
    
    const date = new Date(data_json.timestamp)
    const time_id = Math.floor(date / (1000*60*60)) * (1000*60*60)

    const hex = await Hexas.findOneAndUpdate({
        location: {
            $geoIntersects: {
                $geometry: {
                    type: "Point",
                    coordinates: [data_json.longitude, data_json.latitude]
                }
            }
        }
    }, {
        $inc: {
            [`streams.${stream.stream_name}.${time_id}.total`]: data_json.value,
            [`streams.${stream.stream_name}.${time_id}.count`]: 1
        },
        $max: {
            [`streams.${stream.stream_name}.${time_id}.max`]: data_json.value
        },
        $min: {
            [`streams.${stream.stream_name}.${time_id}.min`]: data_json.value
        }
    }, {
        useFindAndModify: false
    })

    const tmp = await Hexas.find({
        location: {
            $geoIntersects: {
                $geometry: {
                    type: "Point",
                    coordinates: [data_json.longitude, data_json.latitude]
                }
            }
        }
    }).explain("executionStats")

    console.log(tmp)

    await Muns.updateOne({id: hex.municipality}, {
        $inc: { 
            [`streams.${stream.stream_name}.${time_id}.total`]: data_json.value,
            [`streams.${stream.stream_name}.${time_id}.count`]: 1
        },
        $max: {
            [`streams.${stream.stream_name}.${time_id}.max`]: data_json.value
        },
        $min: {
            [`streams.${stream.stream_name}.${time_id}.min`]: data_json.value
        }
    })
    
    let dev = await Device.findOne({device_ID: stream.device_ID})

    if(dev.mobile) {
        await Device.updateOne({device_ID: stream.device_ID}, {
            $push: {
                locations: {
                    timestamp: data_json.timestamp, 
                    latitude: data_json.latitude, 
                    longitude: data_json.longitude
                }
            }
        })
    } else {
        await Device.updateOne({device_ID: stream.device_ID}, {
            locations: [{
                timestamp: data_json.timestamp, 
                latitude: data_json.latitude, 
                longitude: data_json.longitude
            }]
        })
    }

}

async function alert(stream, hexa) {

    var alts = await Alerts.find({})
    alts.forEach( async (element) => {
        const now = new Date()
        let date_id_start = 0
        let date_id_end = 0
        if (element.frequency == "YEAR"){
            date_id_start = now.getTime() - (1000*60*60*24*365)
            date_id_end = now.getTime()
        }
        else if (element.frequency == "DAY") {
            date_id_start = now.getTime() - (1000*60*60*24)
            date_id_end = now.getTime()
        }
        else if (element.frequency == "HOUR") {
            date_id_start = now.getTime() - (1000*60*60)
            date_id_end = now.getTime()
        }

        var total_values = 0
        var count = 0
        if (hexa.streams && element.alert_ID.includes(stream.stream_name)) {
            Object.keys(hexa.streams[stream.stream_name]).forEach(key => {
                if (key >= date_id_start && key < date_id_end) {
                    total_values = total_values + hexa.streams[stream.stream_name][key].total
                    count = count + hexa.streams[stream.stream_name][key].count
                }
            })
            const med = total_values / count
            if (element.type == "MAX") {
                if (med > element.value) {
                    await Alerts.updateOne({"alert_ID": element.alert_ID}, {"active":true})
                }
            } 
            else if (element.type == "MIN") {
                if (med < element.value) {
                    await Alerts.updateOne({"alert_ID": element.alert_ID}, {"active":true})
                }
            } 
            else if (element.type == "MINEQ") {
                if (med <= element.value) {
                    await Alerts.updateOne({"alert_ID": element.alert_ID}, {"active":true})
                }
            }
            else if (element.type == "MAXEQ") {
                if (med >= element.value) {
                    await Alerts.updateOne({"alert_ID": element.alert_ID}, {"active":true})
                }
            }    
        } 
    });
}

async function updateHex(dev, stream, data_json) {

}