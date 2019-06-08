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
const Stream = require('./db/models/streams')
const Hexas = require('./db/models/hexagons')
const Muns = require('./db/models/municipalities')
const Satellites = require('./db/models/satellite')
const Values = require('./db/models/values')
const Alerts = require('./db/models/alerts')

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
    } else if (topic == rootTopic+'streams') {
        Stream.create(data_json).then(() => {
            consumerDebug('Stream created with success')
        }).catch((e) => {
            consumerDebug('Error publishing stream')
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
            municipality: hexa ? hexa.municipality : null
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

    alert(data_json.stream_name, hexa.id, hexa.municipality, data_json.satellite)
}

async function alert(target_stream, hexa, mun, satellite) {

    let alerts = await Alerts.find({target_stream})

    const alarmChecker = {
        MAX: '$gt',
        MAXEQ: '$gte',
        MIN: '$lt',
        MINEQ: '$lte'
    }

    await alerts.forEach( async alert => {
        let end = new Date().getTime();
        let start = 0
        alert.frequency=='HOUR' ? start=end-1000*60*60 : 
            alert.frequency=='DAY' ?  start=end-1000*60*60*24 :
                start=end-1000*60*60*24*365
        if (alert.target=='Municipality') {
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'municipality': hexa
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }
            ]
            if (alert.type=='MAX') {
                aggregation.push({
                    '$match': {
                        average: {
                            $gt: alert.value
                        }
                    }
                })
            } else if (alert.type=='MAXEQ') {
                aggregation.push({
                    '$match': {
                        average: {
                            $gte: alert.value
                        }
                    }
                })
            } else if (alert.type=='MIN') {
                aggregation.push({
                    '$match': {
                        average: {
                            $lt: alert.value
                        }
                    }
                })
            } else {
                aggregation.push({
                    '$match': {
                        average: {
                            $lte: alert.value
                        }
                    }
                })
            }

            let tmp = null
            if (satellite) 
                tmp = await Satellites.aggregate(aggregation)
            else
                tmp = await Values.aggregate(aggregation)
            
            if (tmp.length!=0) {
                activation = {
                    timestamp: (new Date()).getTime(),
                    activations: tmp
                }
                await Alerts.updateOne({_id: mongoose.Types.ObjectId(alert._id) }, {$push: {activations: activation}, active: true})
            }

        }
        else if (alert.target=='Hexagon') {
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }, 
                        'hexagon': hexagon
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }
            ]

            if (alert.type=='MAX') {
                aggregation.push({
                    '$match': {
                        average: {
                            $gt: alert.value
                        }
                    }
                })
            } else if (alert.type=='MAXEQ') {
                aggregation.push({
                    '$match': {
                        average: {
                            $gte: alert.value
                        }
                    }
                })
            } else if (alert.type=='MIN') {
                aggregation.push({
                    '$match': {
                        average: {
                            $lt: alert.value
                        }
                    }
                })
            } else {
                aggregation.push({
                    '$match': {
                        average: {
                            $lte: alert.value
                        }
                    }
                })
            }

            let tmp = null
            if (satellite) 
                tmp = await Satellites.aggregate(aggregation)
            else
                tmp = await Values.aggregate(aggregation)
            
            if (tmp.length!=0) {
                activation = {
                    timestamp: (new Date()).getTime(),
                    activations: tmp
                }
                await Alerts.updateOne({_id: mongoose.Types.ObjectId(alert._id) }, {$push: {activations: activation}, active: true})
            }
        }
        else {
            var aggregation = [
                {
                    '$match': {
                        'stream_name': target_stream, 
                        'created_at': {
                            '$gte': start, 
                            '$lte': end
                        }
                    }
                }, {
                    '$group': {
                        '_id': {
                            'id': '$hexagon', 
                            'municipality': '$municipality'
                        }, 
                        'min': { '$min': '$value' }, 
                        'max': { '$max': '$value' }, 
                        'average': { '$avg': '$value' }, 
                        'count': { '$sum': 1 }
                    }
                }
            ]

            if (alert.type=='MAX') {
                aggregation.push({
                    '$match': {
                        average: {
                            $gt: alert.value
                        }
                    }
                })
            } else if (alert.type=='MAXEQ') {
                aggregation.push({
                    '$match': {
                        average: {
                            $gte: alert.value
                        }
                    }
                })
            } else if (alert.type=='MIN') {
                aggregation.push({
                    '$match': {
                        average: {
                            $lt: alert.value
                        }
                    }
                })
            } else {
                aggregation.push({
                    '$match': {
                        average: {
                            $lte: alert.value
                        }
                    }
                })
            }

            console.log(aggregation)
            let tmp = null
            if (satellite) 
                tmp = await Satellites.aggregate(aggregation)
            else
                tmp = await Values.aggregate(aggregation)
            
            console.log(tmp)

            if (tmp.length!=0) {
                activation = {
                    timestamp: (new Date()).getTime(),
                    activations: tmp
                }
                await Alerts.updateOne({_id: mongoose.Types.ObjectId(alert._id) }, {$push: {activations: activation}, active: true})
            }
        }
    })

    /*
    need to get all alerts
    for each alert: 
        -> check corresponding stream via alert_ID           (now called stream_name)
        -> check frequency                                   (now called freq)
        -> check if range is global, municipality or hexagon (now called range)
            -> range = 'Global', no check           (range=range)
            -> range = 'Municipality', check mun_ID (range=rMun_ID)
            -> range = 'Hexagon', check hex_ID      (range=rHex_ID)
        -> aggregate all values by stream, frequency and range
        [global alerts]:
            -> match {stream_name, freq}
            -> group by {hexagon, municipality}
            -> match {average gt, gte, lt, lte than alarm_limit}
            -> count
            if count >= 0 update active to true
        [hexagon alerts]:
            -> match {stream_name, freq, rHex_ID}
            -> group by {0}
            -> match {average gt, gte, lt, lte than alarm_limit}
            -> count
            if count >= 0 update active to true
        [municipalities alerts]:
            -> match {stream_name, freq, rMun_ID}
            -> group by {0}
            -> match {average gt, gte, lt, lte than alarm_limit}
            -> count
            if count >= 0 update active to true
    */

}