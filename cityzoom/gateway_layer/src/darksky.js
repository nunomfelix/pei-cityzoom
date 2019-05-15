const axios = require('axios')
const fs = require('fs')

async function get_darksky_data(lat, long) {

    var tmp = {}
    var city_info = await axios.get('https://api.darksky.net/forecast/f962475109da7278cd8ca1ba22186bee/' + lat + ',' + long + '?units=si')
    tmp['temperature'] = city_info.data.hourly.data[0].temperature
    tmp['pressure'] = city_info.data.hourly.data[0].pressure
    tmp['humidity'] = city_info.data.hourly.data[0].humidity
    tmp['ozone'] = city_info.data.hourly.data[0].ozone
    

    location = {
        'lat': lat,
        'long': long
    }
    return [tmp, location]
}

//193.136.93.14:8001
async function create_Device(deviceName, verticals, location, municipality) {
    console.log(municipality)
    axios.post('http://localhost:8001/czb/devices', {
        "device_name" : deviceName + "_device",
        "description" : deviceName + "",
        "vertical" : verticals,
        "mobile" : false,
        "latitude" : location[1],
        "longitude" : location[0],
        "provider" : "DarkSky",
        municipality: municipality + ""
    }).catch((err) => {console.log("Failed to create device with error message: " + err)})
    return deviceName + "_device"
}

async function get_Device(location) {
    var data = await axios.get('http://localhost:8001/czb/devices')
                .catch((err) => {console.log("Failed to get device with error message: " + err)})
    var user_devices = data.data.user_devices
    for(i in user_devices){
        if(user_devices[i].locations[0][0].latitude == location[1] & user_devices[i].locations[0][0].longitude == location[0]){
            return user_devices[i].device_id
        }
    }
    return "0"
}

async function create_Stream(streamName, deviceID) {
    axios.post('http://localhost:8001/czb/stream', {
            "stream" : streamName + "_stream",
            "description" : streamName + "",
            "device_id" : deviceID + "",
            "ttl" : 120000,
            "periodicity" : 1200
        }).catch( (err)=> {console.log("Failed creation with message: " + err)})
} 

async function put_Stream(streamName, data, location) {
    axios.post('http://localhost:8001/czb/values', {
        "stream_name":streamName + "_stream",
        "value": data + "",
        "latitude" : location[1],
        "longitude" : location[0]
    }).catch((err) => { console.log('Failed to publish with message: ' + err) })
}

var positions = {}

var obj = JSON.parse(fs.readFileSync('aveiro.geojson', 'utf8'))
//for every location(concelho) in aveiro
for(i in obj.features){
    var latMin = 90
    var latMax = -90
    var longMin = 180
    var longMax = -180
    for(j in obj.features[i].geometry.coordinates){
        for(k in obj.features[i].geometry.coordinates[j]){
            for(l in obj.features[i].geometry.coordinates[j][k]){
                var long = obj.features[i].geometry.coordinates[j][k][l][0]
                var lat = obj.features[i].geometry.coordinates[j][k][l][1]
                if(lat < latMin) latMin = lat
                if(lat > latMax) latMax = lat
                if(long < longMin) longMin = long
                if(long > longMax) longMax = long
            }
        }
    }
    var center_lat = latMin + ((latMax - latMin)/2)
    var center_long = longMin + ((longMax - longMin)/2)
    positions[obj.features[i].properties.name_2] = [center_long, center_lat]
}

for(city in positions){
    var first = true
    var position = positions[city]
    //Create device for each city
    create_Device('darksky', ['AirQuality', 'Temperature'] , position, `${city}`)
    setInterval(async () => {
        var data = await get_darksky_data(position[1],position[0])
        for(var key in data[0]){
            if(first){
                var device_id = await get_Device(position)
                console.log(device_id)
                create_Stream(key, device_id)
            }
            put_Stream(key, data[0][key], position)
        }
        first = false
    }, 10000) //every 2 minutes, making 720 requests a day (the max possible is 1000) 
}
