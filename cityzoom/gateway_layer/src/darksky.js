const axios = require('axios')
const fs = require('fs')

const keys = [
    'f962475109da7278cd8ca1ba22186bee',
    'b91f7d76e6e8638fa72345c58bce52ec',
    'fe7d68e03c713063c78269cc2bf17638',
    'fe3cb56d1611717b5acb72f5243ff0e5',
    '6cadc7e63e8619b65f50c76ca7a9af98',
    'ea4a9ad246f278a30b4c30d8ba3c3c7a',
    'f5e30cf666320006447f251880cad6bc',
    'fbb30e0ea463e37ed450a00bc83504ac',
    '3fc9ee6fa7dc55d6a886f828a49f91b0',
    '8dad0ed09ef497c23ddf5708b62e4c57',
    '042bc0cf651d915dd3a97b94cbc79756',
    '96869db2c419796643976aa5db11363a',
    'ba476533bfa6dcdb18261f70e4b12dbe'
]

async function get_darksky_data(lat, long, key = 'b91f7d76e6e8638fa72345c58bce52ec') {

    var tmp = {}
    var city_info = await axios.get(`https://api.darksky.net/forecast/${key}/` + lat + ',' + long + '?units=si')
    tmp['temperature_stream'] = city_info.data.hourly.data[0].temperature
    tmp['pressure_stream'] = city_info.data.hourly.data[0].pressure
    tmp['humidity_stream'] = city_info.data.hourly.data[0].humidity
    tmp['ozone_stream'] = city_info.data.hourly.data[0].ozone
    

    location = {
        'lat': lat,
        'long': long
    }
    return [tmp, location]
}

//193.136.93.14:8001
async function create_Device(deviceID, deviceName, verticals, municipality) {
    //console.log(municipality)
    await axios.post('http://localhost:8001/czb/devices', {
        "device_ID": deviceID,
        "device_name" : deviceName,
        "description": "",
        "vertical": verticals,
        "mobile": false,
        "provider": "darksky",
        "municipality": municipality
    }).catch((err) => {console.log("Failed to create device with error message: " + err)})
    return deviceName + "_device"
}

async function create_Stream(streamID, streamName, deviceID) {
    await axios.post('http://localhost:8001/czb/streams', {
        "stream_ID": streamID,
        "stream_name" : streamName,
        "description": "",
        "device_ID": deviceID
    }).catch( (err)=> {console.log("Failed to create stream with message: " + err)})
}

/* async function create_Subscription(subID, subName, streamID, deviceID) {
    await axios.post('http://localhost:8001/czb/subscriptions', {
            "subscription_ID": subID,
            "subscription_name" : subName,
            "description": "",
            "stream_ID": streamID,
            "device_ID": deviceID
        }).catch( (err)=> {console.log("Failed to create subscription with message: " + err)})
} */

async function post_Values(streamID, value, lat, long) {
    await axios.post('http://localhost:8001/czb/streams/' + streamID + '/values', {
            "value": value,
            "latitude": lat,
            "longitude": long,
        }).catch( (err)=> {console.log("Failed to post value with message: " + err)})
} 

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

/*
async function test() {
    await create_Device("12345qwerty", "12345qwerty", "Temperature", "Aveiro")
    await sleep(2000)
    await create_Stream("12345qwerty", "12345qwerty" ,"12345qwerty", "Temperature")
    await sleep(2000)
    await post_Values("12345qwerty", 25, 41.2373, -8.401238)
}

test();
*/

(async function main() {
    const devices = []
    var obj = JSON.parse(fs.readFileSync('hex_data.json', 'utf8'))
    let k = 0;
    for(hex in obj){
        var latMin = 90
        var latMax = -90
        var longMin = 180
        var longMax = -180
        for(i in obj[hex]['coordinates']){
            var long = obj[hex]['coordinates'][i][0]
            var lat = obj[hex]['coordinates'][i][1]
            if(lat < latMin) latMin = lat
            if(lat > latMax) latMax = lat
            if(long < longMin) longMin = long
            if(long > longMax) longMax = long
        }
        
        var center_long = longMin + ((longMax - longMin)/2)
        var center_lat = latMin + ((latMax - latMin)/2)

        var device = "device_" + obj[hex]['id']
        await create_Device(device, device, ["Weather", "AirQuality"], obj[hex]['municipality'])
        devices.push({
            device,
            center_long,
            center_lat
        })
        k++
        if(k == 1)
            break;
    }
    const devicesMap = {}
    for(var d in devices) {
        const streams = []
        const tmp = ['temperature_stream', 'ozone_stream', 'pressure_stream', 'humidity_stream']
        for(var stream of tmp) {
            const stream_id = devices[d].device + '_' + stream
            await create_Stream(stream_id, stream, devices[d].device)
            streams.push({
                stream,
                stream_id
            })
        }
        devicesMap[devices[d].device] = streams
    }

    for(var d of devices) {
        for(var lol = 0; lol < 100; lol++) {
            //var data = get_darksky_data(d.center_lat, d.center_long)
            //var data = JSON.parse(fs.readFileSync('kappa.json', 'utf8'))
            for(var stream of devicesMap[d.device]) {
                post_Values(stream.stream_id, Math.random() * 10, d.center_lat, d.center_long)
            }
        }
    }
    // fs.writeFileSync('kappa.json', JSON.stringify(data))
})()
