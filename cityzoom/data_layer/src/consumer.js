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
const Alerts = require('./db/models/alerts')
// const Mutex = require('async-mutex').Mutex
// const mutex = new Mutex();
const Mutex = require('await-mutex').default
let mutex = new Mutex();

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

        let unlock = await mutex.lock()
        const {stream, ...rest} = data_json
        await updateValues(stream, rest)
        unlock()



    }
    
})

async function alert(stream, hexa) {

    var alts = await Alerts.find({})
    alts.forEach( async (element) => {
        const now = new Date()
        console.log(now.getTime() - (1000*60*60*24*365))
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
        Object.keys(hexa.streams[stream.stream_name]).forEach(key => {
            if (key >= date_id_start && key <= date_id_end) {
                total_values = total_values + hexa.streams[stream.stream_name][key].average
                count = count + 1
            }
        })
        const med = total_values / count
        console.log('med '+ med)
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
    });

}

async function updateValues(stream, data_json) {

    let dev = await Device.findOne({device_ID:stream.device_ID}) 
    if (dev.mobile || ( !dev.mobile && dev.locations.length == 0)) {
        try {
            await Device.updateOne({device_ID:stream.device_ID}, {$push: {locations: {timestamp: data_json.timestamp, latitude: data_json.latitude, longitude: data_json.longitude}}})
            consumerDebug(`Updated the location of device ${stream.device_ID}`)
        } catch(err) {
            consumerDebug(`Error updating the location of device ${stream.device_ID}`)
        }
    }
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

    alert(stream, hexa)

    const date = new Date(data_json.timestamp)
    const time_id = Math.floor(date / (1000*60*60)) * (1000*60*60)

    if(!hexa.streams || (!(stream.stream_name in hexa.streams)) || (!(time_id in hexa.streams[stream.stream_name]))) {
        hexa.streams = {
            ...(hexa.streams || {}),
            [stream.stream_name]: {
                ...(hexa.streams && stream.stream_name in hexa.streams ? hexa.streams[stream.stream_name] : {}),
                [time_id]: {
                    max: data_json.value,
                    min: data_json.value,
                    average: data_json.value,
                    count: 1
                }
            }
        }
    } else {
        hexa.streams = {
            ...hexa.streams,
            [stream.stream_name]: {
                ...hexa.streams[stream.stream_name],
                [time_id]: {
                    max: data_json.value > hexa.streams[stream.stream_name][time_id].max ? data_json.value : hexa.streams[stream.stream_name][time_id].max,
                    min: data_json.value < hexa.streams[stream.stream_name][time_id].min ? data_json.value : hexa.streams[stream.stream_name][time_id].min,
                    average: (hexa.streams[stream.stream_name][time_id].average * hexa.streams[stream.stream_name][time_id].count + data_json.value) / (hexa.streams[stream.stream_name][time_id].count + 1),
                    count: hexa.streams[stream.stream_name][time_id].count + 1
                }
            }
        }
    }
    
    var mun = await Muns.findOne({id: hexa.municipality})

    if(!mun.streams || (!(stream.stream_name in mun.streams)) || (!(time_id in mun.streams[stream.stream_name]))) {
        mun.streams = {
            ...(mun.streams || {}),
            [stream.stream_name]: {
                ...(mun.streams && stream.stream_name in mun.streams ? mun.streams[stream.stream_name] : {}),
                [time_id]: {
                    max: data_json.value,
                    min: data_json.value,
                    average: data_json.value,
                    count: 1
                }
            }
        }
    } else {
        mun.streams = {
            ...mun.streams,
            [stream.stream_name]: {
                ...mun.streams[stream.stream_name],
                [time_id]: {
                    max: data_json.value > mun.streams[stream.stream_name][time_id].max ? data_json.value : mun.streams[stream.stream_name][time_id].max,
                    min: data_json.value < mun.streams[stream.stream_name][time_id].min ? data_json.value : mun.streams[stream.stream_name][time_id].min,
                    average: (mun.streams[stream.stream_name][time_id].average * mun.streams[stream.stream_name][time_id].count + data_json.value) / (mun.streams[stream.stream_name][time_id].count + 1),
                    count: mun.streams[stream.stream_name][time_id].count + 1
                }
            }
        }
    }

    try {
        await Device.updateOne({device_ID: stream.device_ID}, {hexagon: hexa.id})
        await hexa.save()
        await mun.save()
        await Values.create(data_json)
        consumerDebug('Values published in the database')
    } catch(err) {         
        consumerDebug('Error publishing in the database')
    }

}