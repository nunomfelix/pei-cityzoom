const axios = require('axios')
const fs = require('fs')

async function get_darksky_data(lat, long) {

    var tmp = {}
    var city_info = await axios.get('https://api.darksky.net/forecast/b91f7d76e6e8638fa72345c58bce52ec/' + lat + ',' + long + '?units=si')
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

async function create_Stream(streamID, streamName, deviceID, type) {
    await axios.post('http://localhost:8001/czb/streams', {
            "stream_ID": streamID,
            "stream_name" : streamName,
            "description": "",
            "device_ID": deviceID,
            "type": type
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
            "longitude": long
        }).catch( (err)=> {console.log("Failed to post value with message: " + err)})
} 

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    await create_Device("12345qwerty", "12345qwerty", "Temperature", "Aveiro")
    await sleep(2000)
    await create_Stream("12345qwerty", "12345qwerty" ,"12345qwerty", "Temperature")
    await sleep(2000)
    await post_Values("12345qwerty", 25, 41.2373, -8.401238)
} 

main()

/* (async function main() {
    var obj = JSON.parse(fs.readFileSync('a.json', 'utf8'))
    //for every municipality in aveiro
    for(mun in obj){
        for(area in obj[mun]){
            for(polygon in obj[mun][area]){
                var latMin = 90
                var latMax = -90
                var longMin = 180
                var longMax = -180
                for(coords in obj[mun][area][polygon]){
                    var long = obj[mun][area][polygon][coords][0]
                    var lat = obj[mun][area][polygon][coords][1]
                    if(lat < latMin) latMin = lat
                    if(lat > latMax) latMax = lat
                    if(long < longMin) longMin = long
                    if(long > longMax) longMax = long
                }
                var center_long = longMin + ((longMax - longMin)/2)
                var center_lat = latMin + ((latMax - latMin)/2)
                var data = await get_darksky_data(center_lat, center_long)
                var device = "device_" + mun + "_" + polygon
                var stream = "stream_" + mun + "_" + polygon
                var subscription = "suscription_" + mun + "_" + polygon
                await create_Device(device, device, "Temperature", mun)
                await sleep(2000)
                await create_Stream(stream, stream ,device, "Temperature")
                await sleep(2000)
                await post_Values(subscription, data[0].temperature, data[1].lat, data[1].long)
            }
        }

    }

})() */