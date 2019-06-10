const axios = require('axios')
const fs = require('fs')

async function get_darksky_data(lat, long, key = 'f962475109da7278cd8ca1ba22186bee') {

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
    console.log('Creating device at ' + municipality + 'with ID: ' + deviceID)
    await axios.post('http://localhost:8001/czb/devices', {
        "device_ID": deviceID,
        "device_name" : deviceName,
        "description": "",
        "vertical": verticals,
        "mobile": false,
        "provider": "DarkSkyAPI",
        "municipality": municipality
    }).catch((err) => {console.log("Failed to create device with error message: " + err)})
    return deviceName + "_device"
}

async function post_Values(streamName, value, lat, long, device) {
    console.log(lat, long, value, device)
    await axios.post('http://localhost:8001/czb/values/' + streamName, {
        device_ID: device,
        value : value,
        latitude : lat,
        longitude : long,
    })
    .then((res) => {})
    .catch(async (err)=> {console.log(err);})
} 

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

(async function main() {
    if(!process.argv[2] | process.argv[2] > 1725){
        console.log('Instructions of use: \n'+
                    'node darksky.js n [name] \n' + 
                    'n --> number of devices to create, up to 1725 \n'+ 
                    'name (optinonal) --> base name of the devices to create \n'+ 
                    'Run inside src folder in gateway_layer!')
        return 
    }
    const devices = []
    var obj = JSON.parse(fs.readFileSync('hex_data.json', 'utf8'))
    let k = 0;
    for(hex in obj){
        if(k < process.argv[2]){
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

            var device = process.argv[3] ? process.argv[3] + obj[hex]['id'] : "deviceV3_" + obj[hex]['id']
            await create_Device(device, device, ["Temperature", "AirQuality"], obj[hex]['municipality'])
            devices.push({
                device,
                center_long,
                center_lat
            })       
            k++
        }
    }

    const devicesMap = {}
    for(var d in devices) {
        const streams = []
        const tmp = ['temperature_stream', 'ozone_stream', 'pressure_stream', 'humidity_stream']
        for(var stream of tmp) {
            const stream_id = devices[d].device + '_' + stream
            streams.push({
                stream,
                stream_id
            })
        }
        devicesMap[devices[d].device] = streams
    }

    for(var d of devices) {
        //var data = await get_darksky_data(d.center_lat, d.center_long)
        var data = [{
                        'temperature_stream': Math.random() * (100),
                        'ozone_stream': Math.random() * (100),
                        'pressure_stream': Math.random() * (100),
                        'humidity_stream': Math.random() * (100)},
                    {
                        'lat' : d.center_lat,
                        'long': d.center_long
                    }]
        for(var stream of devicesMap[d.device]) {
            await post_Values(stream.stream, data[0][stream.stream], d.center_lat, d.center_long, d.device)
        }
    }
})()