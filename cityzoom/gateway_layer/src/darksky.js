const axios = require('axios')

async function get_darksky_data(lat, long) {

    var tmp = {}
    var city_info = await axios.get('https://api.darksky.net/forecast/f962475109da7278cd8ca1ba22186bee/' + lat + ',' + long + '?units=si')
    tmp['TemperatureOut'] = city_info.data.hourly.data[0].temperature
    tmp['Pressure'] = city_info.data.hourly.data[0].pressure
    tmp['Humidity'] = city_info.data.hourly.data[0].humidity
    tmp['UvIndex'] = city_info.data.hourly.data[0].uvIndex
    tmp['WindSpeed'] = city_info.data.hourly.data[0].windSpeed
    tmp['Precipitation'] = city_info.data.hourly.data[0].precipIntensity
    

    location = {
        'lat': lat + '',
        'long': long + ''
    }
    return [tmp, location]
}

async function create_Device(deviceName, location) {
    axios.post('http://193.136.93.14:8001/czb/devices', {
        "device_name" : "device_" + deviceName,
        "description" : deviceName + "",
        "vertical": deviceName + "",
        "mobile": true,
        "latitude": location.lat,
        "longitude": location.long
    }).catch( (err) => {console.log("Failed to create device with message: " + err)})
}

async function get_Device(deviceName) {
    var data = await axios.get('http://193.136.93.14:8001/czb/devices')
    var user_devices = JSON.parse(JSON.stringify(data.data.user_devices))
    for(i in user_devices){
        if(user_devices[i].device_name == deviceName){
            return user_devices[i].device_id
        }
    }
    return "0"
}

async function create_Stream(streamName, deviceID) {
    axios.post('http://193.136.93.14:8001/czb/stream', {
            "stream" : "stream_" + streamName,
            "description" : streamName + "",
            "device_id" : deviceID + "",
            "type" : streamName + "",
            "ttl" : 120000,
            "periodicity" : 1200
        }).catch( (err)=> {console.log("Failed creation with message: " + err)})
} 

async function put_Stream(streamName, data, location) {
    axios.post('http://193.136.93.14:8001/czb/values', {
        "stream_name": "stream_" + streamName,
        "value": data + "",
        "latitude" : location.lat,
        "longitude" : location.long
    }).catch((err) => { console.log('Failed to publish with message: ' + err) })
}

async function main() {
    var lat = 40.6322758
    var long = -8.6496226
    var first = true

    setInterval(async () => {
        //Create device for each category
        for(var key in data[0]){
            if(first){
                create_Device(key, {"lat": lat, "long": long})
                var device_id = await get_Device('device_' + key)
                create_Stream(key, device_id)
            }
        }
        first = false
    }, 1000*120) //every 2 minutes, making 720 requests a day (the max possible is 1000)
}

main()