const axios = require('axios')
const fs = require('fs')
const Mutex = require('async-mutex').Mutex

//193.136.93.14
const breezo_keys = [
    '7430fce52939404185c19493fe3afba1',
    '8f53519392f3451a9f38b51d2107f85d',
    'ef955152477f4e91a450c8fe0a490ca6',
    'bad40c2d6b9b43a7984b03fd46b7c774',
    '945bf159b01048acbd3c9b1331414047',
    '511496f3ff1b49a58989321f29ce582a',
    'd0dd75db93ae4e73bdea563cf64be1c4',
    '27ee67c4f4184c9f80444c9f4f3190f9',
    '145aba8d93984aeca3b459298435156e',
    'd691e56f6cdc4902b7cbe5e81bc2c9dc',

]
const darksky_keys = [
    '57fa26ea3095ee3dfb65bb7b4b056568',
    'b4b1a0d138803dab4c20044723a537e1',
    '254dff782817a8f805e4e929e64b2e06',
    '3fa211cbcdfdc92b759c953d4b26e1f4',
    '40e934497a11ef18cc1dfb4396280cdb',
    '946dc73ea27693044c38d8e3701edade',
    '5369695e33b0c9377d28b8618c8fc29b',
    '3dd8153fcfe473b3a7c7236343b4ac28',
    '411b8449c4c4600c023dd96f91a11b1f',
    '934877fe8591b69fd3afa1b27b32cac6',
]


async function get_breezometer_data(lat, long, key = 'f55cfd01f2ab42ccb517e40844a18797') {

    var tmp = {}
    var city_info = await axios.get('https://api.breezometer.com/air-quality/v2/current-conditions?lat='+lat+'&lon='+long+'&key='+key+'&features=pollutants_concentrations')
    tmp['no2_stream'] = city_info.data.data.pollutants.no2.concentration.value
    tmp['ozone_stream'] = city_info.data.data.pollutants.o3.concentration.value
    tmp['pm10_stream'] = city_info.data.data.pollutants.pm10.concentration.value
    tmp['pm25_stream'] = city_info.data.data.pollutants.pm25.concentration.value

    location = {
        'lat': lat,
        'long': long
    }
    return [tmp, location]
}

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

//localhost:8001
/* async function create_Device(deviceID, deviceName, verticals, municipality) {
    await axios.post('http://localhost:8001/czb/devices', {
        "device_ID": deviceID,
        "device_name" : deviceName,
        "description": "",
        "vertical": verticals,
        "mobile": false,
        "provider": "beezometer"
    }).catch((err) => {console.log("Failed to create device with error message: " + err)})
    return deviceName + "_device"
}
 */
/* async function create_Stream(streamID, streamName, deviceID) {
    await axios.post('http://localhost:8001/czb/streams', {
        "stream_ID": streamID,
        "stream_name" : streamName,
        "description": "",
        "device_ID": deviceID
    }).catch( (err)=> {console.log("Failed to create stream with message: " + err)})
}
 */
/* async function create_Subscription(subID, subName, streamID, deviceID) {
    await axios.post('http://localhost:8001/czb/subscriptions', {
            "subscription_ID": subID,
            "subscription_name" : subName,
            "description": "",
            "stream_ID": streamID,
            "device_ID": deviceID
        }).catch( (err)=> {console.log("Failed to create subscription with message: " + err)})
} */

async function post_Values(streamName, value, lat, long) {
    console.log(lat, long)
    await axios.post('http://localhost:8001/czb/values/' + streamName, {
        satellite: true,
        "value": value,
        "latitude": lat,
        "longitude": long,
    })
    .then((res) => {})
    .catch(async (err)=> {console.log(err);})
} 

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function main() {

    console.log("Breezo: ", breezo_keys.length)
    console.log("Darksy: ", darksky_keys.length)
    console.log("Starting")

    const devices = []
    var obj = JSON.parse(fs.readFileSync('hex_data.json', 'utf8'))
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

        var device = "device_APIs" +obj[hex]['id']
        //await create_Device(device, device, ["Weather", "AirQuality"], obj[hex]['municipality'])
        devices.push({
            device,
            center_long,
            center_lat
        })
        // k++
        // if(k == 10)
        //     break;
    }
    await sleep(200);
    const breezo_devicesMap = {}
    const darksky_devicesMap = {}
    for(var d in devices) {
        var streams = []
        const breezo_tmp = ['ozone_stream','pm10_stream','pm25_stream','no2_stream']
        const darksky_tmp = ['temperature_stream', 'ozone_stream', 'pressure_stream', 'humidity_stream']
        for(var stream of breezo_tmp) {
            const stream_id = devices[d].device + '_' + stream
            //await create_Stream(stream_id, stream, devices[d]. Math.random() * 1device)
            streams.push({
                stream,
                stream_id
            })
        }
        breezo_devicesMap[devices[d].device] = streams
        streams = []
        for(var stream of darksky_tmp) {
            const stream_id = devices[d].device + '_' + stream
            //await create_Stream(stream_id, stream, devices[d].device)
            streams.push({
                stream,
                stream_id
            })
        }
        darksky_devicesMap[devices[d].device] = streams
    }
    await sleep(200);
    //Circular buffer that goes arround our API keys.
    //This way we can make a rrsequest with one key at a time.
    var breezo_i = 0
    var darksky_i = 0
    let promises = []

    const amount = devices.length / process.argv[2]
    const start = amount * process.argv[3]
    console.log(start, amount)

    const mutex = new Mutex()

    while(true) {

        let promises = []
        
        for(var d in devices) {

            if(d >= start && d < start + amount) {
                const tmp = devices[d]

                promises.push(() => {
                    return new Promise(async (resolve) => {
                        let count = 0
                        let tryAgain = true
                        while(tryAgain) {
                            try {
                                var breezo_data = await get_breezometer_data(tmp.center_lat, tmp.center_long, breezo_keys[breezo_i])
                                for(var stream of breezo_devicesMap[tmp.device]) {
                                    post_Values(stream.stream, breezo_data[0][stream.stream], tmp.center_lat, tmp.center_long)
                                }
                                await mutex.acquire().then((release)=>{
                                    breezo_i = (breezo_i + 1) % breezo_keys.length
                                    tryAgain = false
                                    release()
                                })
                                .catch()                               
                            } catch(err) {
                                console.log("Failed breezo")
                                breezo_keys.splice(breezo_i, 1);
                                await mutex.acquire().then((release)=>{
                                    breezo_i = (breezo_i) % breezo_keys.length
                                    count++
                                    if(count < 10)
                                        tryAgain = true
                                    else 
                                        tryAgain = false
                                    release()
                                })
                                .catch()
                            }
                        }
                        resolve()        
                    })
                })
                
    
                promises.push(() => {
                    return new Promise(async (resolve) => {
                        let count = 0
                        tryAgain = true
                        try {
                            var darksky_data = await get_darksky_data(tmp.center_lat, tmp.center_long, darksky_keys[darksky_i])
                            for(var stream of darksky_devicesMap[tmp.device]) {
                                post_Values(stream.stream, darksky_data[0][stream.stream], tmp.center_lat, tmp.center_long)
                            }
                            await mutex.acquire().then((release)=>{
                                darksky_i = (darksky_i + 1) % darksky_keys.length
                                tryAgain = false
                                release()
                            })
                            .catch()                           
                        } catch(err) {
                            console.log("Failed darksy")
                            darksky_keys.splice(darksky_i, 1);
                            await mutex.acquire().then((release)=>{
                                darksky_i = (darksky_i) % darksky_keys.length
                                count++
                                if(count < 10)
                                    tryAgain = true
                                else 
                                    tryAgain = false
                                release()
                            })
                            .catch()
                        }
                        resolve()
                    })
                })
    
                if(promises.length >= 20) {
                    await Promise.all(promises.map(p => p()))
                    promises = []
                }
            }
            
        }
        await sleep(1800000)
    }


    // while(true) {
    //     const time = promises.length / 5
    //     for(var i = 0 ; i < 4; i++) {
    //         const tmp = []
    //         for(var j = 0; j < time; j++) {
    //             tmp[j] = promises[(i * time) + j]
    //         }
    //         if(tmp[0]) 
    //             Promise.all(tmp.map(p => p()))
    //         await sleep(2000)
    //     }
    //     await sleep(1800000 * .9)
    // }
        

})()


/* async function test_posts() {
    await create_Device("12345qwerty", "12345qwerty", "Temperature", "Aveiro")
    await sleep(2000)
    await create_Stream("12345qwerty", "12345qwerty" ,"12345qwerty", "Temperature")
    await sleep(2000)
    await post_Values("12345qwerty", 25, 41.2373, -8.401238)
    var i = 0
    for(var k=0; k<20; k++) {
        var data = await get_breezometer_data('40.633317', '-8.659720', keys[i])
        console.log(data[0])
        i = (i+1) % keys.length
    }
}

test_posts()*/