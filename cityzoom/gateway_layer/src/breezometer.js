const axios = require('axios')
const fs = require('fs')

const keys = [
    'f55cfd01f2ab42ccb517e40844a18797',
    'f4e445e5a9ed4269ab75a95fd5ca1558',
    '9db2eccd0bfb4d74a86c13cb177c8f84',
    '965c452864bd4dff902e08a4d93799f0',
    '091ded6a357242328af1451e13464a68',
    '82dbfe9d1ef04dce9c01053ade1d3b90',
    'f7bab5c50ffb49218bd4750284df006e',
    'db69e8084d414d7fbe4ea16b0c2a86e5',
    'a61869cdc9ee4893a5200ddbf35f2442',
    'fc78b642ea0c43978a1f80b7b529b8f3',
    '3fd5da64b8494c5e9247cb89393f7152',
    '18cff0fa345d47c191ea62ed7c884f88',
    'e2922410f76e4a93bae7beea7757d8a7',
    '51e7d40fca2349bf808fe62c655bff49',
    'db0d510ed58f4bcb9364e2daf2d01095'
]

async function get_breezometer_data(lat, long, key = 'f55cfd01f2ab42ccb517e40844a18797') {

    var tmp = {}
    console.log('https://api.breezometer.com/air-quality/v2/current-conditions?lat='+lat+'&lon='+long+'&key='+key+'&features=pollutants_concentrations')
    var city_info = await axios.get('https://api.breezometer.com/air-quality/v2/current-conditions?lat='+lat+'&lon='+long+'&key='+key+'&features=pollutants_concentrations')
    tmp['no2_stream'] = city_info.data.data.pollutants.no2.concentration.value
    tmp['o3_stream'] = city_info.data.data.pollutants.o3.concentration.value
    tmp['pm10_stream'] = city_info.data.data.pollutants.pm10.concentration.value
    tmp['pm25_stream'] = city_info.data.data.pollutants.pm25.concentration.value

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
                    'node breezometer.js n [name] \n' + 
                    'n --> number of devices to create, up to 1725 \n'+ 
                    'name (optinonal) --> base name of the devices to create \n'+ 
                    'Run inside src folder in gateway_layer!')
        return 
    }
    const devices = []
    var obj = JSON.parse(fs.readFileSync('hex_data.json', 'utf8'))
    let k = 0;
    for(hex in obj){
        if(k < process.argv[2]) {
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

            var device = process.argv[3] ? process.argv[3] + obj[hex]['id'] : "device_breezometer" +obj[hex]['id']
            await create_Device(device, device, ["AirQuality"], obj[hex]['municipality'])
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
        const tmp = ['no2_stream','o3_stream','pm10_stream','pm25_stream']
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
        //var data = await get_breezometer_data(d.center_lat, d.center_long, keys[i])
        var data = [{
                        'no2_stream': Math.random() * (100),
                        'o3_stream': Math.random() * (100),
                        'pm10_stream': Math.random() * (100),
                        'pm25_stream': Math.random() * (100)},
                    {
                        'lat' : d.center_lat,
                        'long': d.center_long
                    }]
        for(var stream of devicesMap[d.device]) {
            await post_Values(stream.stream, data[0][stream.stream], d.center_lat, d.center_long, d.device)

        }
    }
})()