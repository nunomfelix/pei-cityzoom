const axios = require('axios')
const fs = require('fs')

//193.136.93.14
const breezo_keys = [
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
    'c0c8d52c93dc4267a550f6622b8bfd0c',
    '51e7d40fca2349bf808fe62c655bff49',
    'db0d510ed58f4bcb9364e2daf2d01095',
    '0c434581acc54ecc91ef8db18b7cfc64',
    '6f1a3af505ab43efa4d18eb6f7bab653',
    'a70edc6b1b0b4033bad557bf0de3d249',
    'ceb05e0ba10246369635f5b5cc36f244',
    'cf1c63b379a44a2e890c5bce8b60e4ab',
    '11d6e9e877fd46ac8fd3f8c4a0f2ce2a',
    '38019c51d038428790477ce0368e549a',
    '6f1a3af505ab43efa4d18eb6f7bab653',
    '423e3c4170b949a994ab76e54ae390fb',
    'e40568ce710a4619810854dfc6231814',
    'f0d8171df51d48d8bba9d819674d7d00',
    '44e50a12eeca4914b5effacbc648fbf8',
    '8c8ed63a491e4c09a63217cfe3dca12e',
    '7b033f2524ca4bdb9c6563748001c475',
    'd955f2e040f746c2b38abd07eb3d4f4b',
    '70df097d055e47f49888b122579df21c',
    '8b87538cfe5f420fad87caa3e21d9e95',
    'deb6bcf0a10547858ae6d739ba1f2c00',
    '22b8a0d4869f4503ae8fb0b25b13dbe2',
    '91f55691c0ab46c6877ef1f4e8b7be89',
    '8d3b2deb02cf4aafbb6f6847aa2436a0',
    '5883221f45dd442b83d1b427b3f55432',
    'b9b1f9ed5f1f4c7c9af76fb32f3e8f2a',
    'a9e6cb07d1764d73b50003c345f42970',
    '97a814b4e1d047e3ad10c43175e85780',
    '096159fb622d431386fde8c628c026b1',
    '301fb1e4c67f4ac4a8acb4da790d4d33',
    'f2b54e3da91f46c1af9156c942d9d7bd',
    '0b706439fb6b44bb98ff4fd10ac18e44',
    'ae0cf50153a643e49969bda353dbaf3a',
    '97e9125ed4d64113b51679fbdd90f70e',
    'f8021a48f9f246379729353c9a9dbfc1',
    '771155ccf4584d729b07eb86e2e784ee',
    'a5397d50a0904294b89f98fa73b017d1',
    '3e927d200b6e48bf86ecea840da50544',
    'fd840a084300447bbbcbee6475f023a4',
    'c0d6f9dbd02d47cea48aead9169149e2',
    '64c8cc1203c2406bad4a843ff35b6ce6',
    '1754f3a173f24dcbb63d9a1b880af16d',
    'ee2eb703a148472a812c22f866469888',
    '59e4eace0d5f4094b531d63b1a85244e',
    '763780a6d3f04267b3731eeffced0f9c',
    '34a502f162b24ed485b859fc19f82e27', 
    'be15ecb8cb74494987a058c651cb574f',
    '8304cab9dfbb497783fa31b439296bc6',
    '8ec5318839cf4d1c8b11c9ce8bf2be5d',
]

const darksky_keys = [
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
    'ba476533bfa6dcdb18261f70e4b12dbe',
    'f44e534bd0f691693e1e132e443a0de4',
    '81940e6ae198d35da489ffe38e8b1c15',
    'cc64ab59625cb650c87ae665987744c9',
    '8fba66feb057eb1595ee759e575ddd78',
    'fe52c0d9e44237ed18324840a7abcc63',
    '5b853daf6b35f471876d08533fe075b3',
    '0ef30b671e97352332cc96984daf432a',
    'c281a5b644e2566c54c5dbbf34f9b1cf',
    '865328edd1d97b1d07a8ece42827178d',
    'a513445da8bd1b299a09f8ee9d86553b',
    'f3ef2a43aa21c60ddef84d4c3ee69ef0',
    '51f605be98cb3926a482266412d71d1e',
    'b183e9c5f8769bd3751d7bb24bd91ede',
    'c66c265f6afeb6257df27e4eaf5af851',
    '5c6b9d052c757e648c863a64b46441f8',
    '6c70cb2e4242ee7d4bccf3e25725c9a8',
    '1c276829620f5911e92545df8733fd74',
    '1ba4f7380b4c93374685a58aba444098',
    'db86e66ccac6868b630fee470d140c6c',
    '04f6ab6e27726d07f02488655bb350ed',
    '047ebce8c1397837d5ab6b03748a806b',
    '4ee021be72c74dfc0b9a1c2695b671c1',
    'b28cbd79bd3da228026c12c324c4ac71',
    '9348459b7a62eeca8bdb27f5d567838e',
    '254b8413aef55f08aa2eab9435d264a1',
    '6938dfc6d975278e299c35fa59738043',
    '6a0f7ab45ddb2972d7fc8c31893a825a',
    'f891812b2d1b5d0b414eac9371aaafdd',
    '4c02689043e952939ec5b1398b4872e0',
    '262f537367fe50c2cd4fb699fc25d6a2',
    'ad5eb08180aa92c45e006000b19572ef',
    '254adc3be3d507ef050df108e144a87a',
    'fde39ea5fbbb866a8c88455f79bf0965',
    'b828b7103f2b01deca147c9a232577b9',
    'dbb83d6c040e110ec13062c3465002b2',
    '73ef0e48df2ae9c8fd0f949fe442e167',
    '0b2111ee5b82de9a68f7006cd1ae8890',
    '00b3398a08c0a420ee410de24b484086',
    '91a6ad78cf2a02fa29c775f5c8646fa5',
    'bf323a3daaa64f6b4d1750a32390f4e5',
    '1736c8b5667284684a3c33dc4d74284d',
    'c6d67b702ed940799e44b7b36d7df5c9',
    '76383e87904956e4ec65fa2bf8a0725c',
    'b2522b5cd36f15dc4dd5fb582024026a',
    'eca469d52049e580c30c2074967013c2',
    '71e75bb6df6ddff6952eec41eb7f4c77',
    'fea51fa4c623c8029ee4f5cf8339ef34',
    '8fad431eb780aa026b67953778b05cae',
]


async function get_breezometer_data(lat, long, key = 'f55cfd01f2ab42ccb517e40844a18797') {

    var tmp = {}
    var city_info = await axios.get('https://api.breezometer.com/air-quality/v2/current-conditions?lat='+lat+'&lon='+long+'&key='+key+'&features=pollutants_concentrations')
    // tmp['co_stream'] = city_info.data.data.pollutants.co.concentration.value
    tmp['no2_stream'] = city_info.data.data.pollutants.no2.concentration.value
    tmp['ozone_stream'] = city_info.data.data.pollutants.o3.concentration.value
    tmp['pm10_stream'] = city_info.data.data.pollutants.pm10.concentration.value
    tmp['pm25_stream'] = city_info.data.data.pollutants.pm25.concentration.value
    //tmp['so2_stream'] = city_info.data.data.pollutants.so2.concentration.value

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
async function create_Device(deviceID, deviceName, verticals, municipality) {
    //console.log(municipality)
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

counter = 1

async function post_Values(streamID, value, lat, long) {
    console.log(lat, long)
    await axios.post('http://localhost:8001/czb/streams/' + streamID + '/values', {
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
    // console.log("Waiting 11 mins")
    // await sleep(1000*60*11)
    console.log("Starting")

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
        console.log(center_long)

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
                                breezo_i = (breezo_i + 1) % breezo_keys.length
                                tryAgain = false
                            } catch(err) {
                                console.log("Failed breezo")
                                breezo_keys.splice(breezo_i, 1);
                                breezo_i = (breezo_i) % breezo_keys.length
                                count++
                                if(count < 10)
                                    tryAgain = true
                                else 
                                    tryAgain = false
                            }
                        }
                        resolve()        
                    })
                })
                
    
                promises.push(() => {
                    return new Promise(async (resolve) => {
                        let count = 0
                        tryAgain = true
                        while(tryAgain) {
                            try {
                                var darksky_data = await get_darksky_data(tmp.center_lat, tmp.center_long, darksky_keys[darksky_i])
                                for(var stream of darksky_devicesMap[tmp.device]) {
                                    post_Values(stream.stream, darksky_data[0][stream.stream], tmp.center_lat, tmp.center_long)
                                }
                                darksky_i = (darksky_i + 1) % darksky_keys.length
                                tryAgain = false
                            } catch(err) {
                                console.log("Failed darksy")
                                darksky_keys.splice(darksky_i, 1);
                                darksky_i = (darksky_i) % darksky_keys.length
                                count++
                                if(count < 10)
                                    tryAgain = true
                                else 
                                    tryAgain = false
                            }
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