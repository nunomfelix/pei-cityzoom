const axios = require('axios')
const fs = require('fs')
const Mutex = require('async-mutex').Mutex

//193.136.93.14
const breezo_keys = [
    '4be0d50403ba413c8ca40d8b6c77e52d',
    '38e029afb15e423aa4c5b9aa3ff4d1f5',
    '757d5cc6853543bbb3e4492c9457bf4e',
    '317138dd60af47c5b4799ad4327c02a1',
    'b4ffd5f06b824b3eb50f8ace1231b562',
    'b0121323c74b46a7ae5e5dcc4417e3dd',
    '7dab1a78dee7413cab6a9a8b881e58b9',
    '26a66d20d1c14c2c81d584bd665e4b64',
    'f76a4f6e6bb44acaa42464f5d9a930cc',
    '21a53f96ea144634848acc1df22cfd97',
    'e09c477f7ce74ff6ac106bbe459c9d46',
    'c877eed0ba1749da8631f6af570378d2',
    'f8214d7107cd47808a53f0102be26a48',
    'eaaa87f25449483baa6db3088c79ad54',
    'e721124b2bf545e6b4f59dbac5ab0660',
    'd8510b4c17dc43d08521fb012f676ddc',
    'f4388aa0d2a74dcfb6283ef77bf26c18',
    'd5f2071bf90e4bada4eb418d5ad228dd',
    '88530281b7354ac29649ec50372c7795',
    '9dcef50cf4784ab581f132a399b525ff',
    'f123efdf76b74864ab174a63709259ab',
    '7a999e9f2513457bae4e783507ec77b7',
    '881c10a12d9147f28c798ce6e0af6e26',
    '41624b729eb943e7b631c693dc2c656e',
    'dfc2b5de270b48ff8fa0998ce2633217',
    '6feea3b4e93f42b3b0c7663660de5e77',
    'b0c1b3af3993431b8d90996cd34fd0d7',
    '52dbffcbb006474291d72a50a2aa80cc',
]

const darksky_keys = [
    '28ce732ef46cd7140b8496a17313642f',
    'de6eb944ddbe4a8bd8a6bf669b4dfab9',
    'be6dad72bb19e0f81c11dddb229729e6',
    '431b9a3163b9e2821194bf8a2704a992',
    'bc45ea45780d58715c58c5f19a44a595',
    'ba4bcc7488700dd7a4615cb550722d62',
    '8bd67fe6b6a85d23d146954b801fcfa0',
    'c919b7d7409aa3aa9b76ca3c5a244112',
    '5bec8d31b4578bee3f4d48704ec5e0ac',
    'bbefab1a72c961adb283825a3c7e981e',
    'e034a28e1c85845686642f4796273e95',
    'a390de40fe0975722739d597773c6402',
    '30889c72127e31b108f855f3aa5bd354',
    '916feee0b2f73e9a489e9f1a3b89cb4e',
    '78e8e128bc7be226321b3e8435c2f6a7',
    '938d28ca4603919c808f05abef11af94',
    '65e035d46179ee81004b0fac48d746c8',
    'ecb0add31029d30ea8d72e3033dd37c8',
    '05418af3c2551a9bfb03515b4d8fab4c',
    '9a3601377bdd65d4e4e4b7cc1c6bc0a7',
    'ec2538e4212352a78bcd7b339e1d0f63',
    '32278ca7bceec3efa05a79081b96a341',
    '70362a2f3a1fd06c2c29826a1fe969fa',
    'aa7aca7c837c566ff0a087b881694a10',
    '2a135f39e38a1d9344fcae7405a44ed7',
    '53bbd238d6faa599d8209ed502b2c2c1',
    'e5669299df97d8e4927802419e010f7b',
    '16e961841696b8cca0862cfd62b1a45a',
]


async function get_breezometer_data(lat, long, key = '7a52e770e6244ca98e03948e46c16aca') {

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
async function post_Values(streamName, value, lat, long) {
    console.log(lat, long)
    await axios.post('http://193.136.93.14:8001/czb/values/' + streamName, {
        satellite: true,
        "value": value,
        "latitude": lat,
        "longitude": long,
    })
    .then((res) => {})
    .catch(async (err)=> {console.log('Failed to post value to' + streamName);})
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

    const mutex = new Mutex()

    while(true) {

        let promises = []
        
        for(var d in devices) {
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
                    while(tryAgain) {
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
                    }
                    resolve()
                })
            })

            if(promises.length >= 20) {
                await Promise.all(promises.map(p => p()))
                promises = []
            }
        }
        console.log('Waiting 30 mins...')
        await sleep(1800000)
	console.log('Waiting 30 minutes...')
    }
})()
//BREEZO KEYS

/*     'f55cfd01f2ab42ccb517e40844a18797',
    'f4e445e5a9ed4269ab75a95fd5ca1558',
    '9db2eccd0bfb4d74a86c13cb177c8f84',
    '965c452864bd4dff902e08a4d93799f0',
    '091ded6a357242328af1451e13464a68',
    '82dbfe9d1ef04dce9c01053ade1d3b90',
    'f7bab5c50ffb49218bd4750284df006e',
    'db69e8084d414d7fbe4ea16b0c2a86e5',
    'a61869cdc9ee4893a5200ddbf35f2442',
    'fc78b642ea0c43978a1f80b7b529b8f3',
    THE KEYS ABOVE DON'T WORK ANYMORE
    '3fd5da64b8494c5e9247cb89393f7152',
    '18cff0fa345d47c191ea62ed7c884f88',
    'e2922410f76e4a93bae7beea7757d8a7', 
    'c0c8d52c93dc4267a550f6622b8bfd0c',
    '51e7d40fca2349bf808fe62c655bff49',
    'db0d510ed58f4bcb9364e2daf2d01095',
    '0c434581acc54ecc91ef8db18b7cfc64',
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
    '668b77c5edb143f7be010fe272754e9c',
    '6f1b68c2398b4168aeabcfcdba30cd13',
    '6f1b68c2398b4168aeabcfcdba30cd13',
    '153639693573411392b24e0b3dca10ff',
    'b80183ee898945cf92c653dcf2bc64ab',
    'ec559cfe4e1c46b2b85a6a005f6815bd',
    '0dc55c9b6a5f4a10af1500d35821c7b4',
    '2164502f90214397bda9fef5504c92eb',
    '87a4ad9a13b04605aeb3f6ea37468d24',
    '7406e7fd8fba4a3891d74eceae537626',
    '17ac35a93e44420995cd69cd03a5cd6e',
    '7a52e770e6244ca98e03948e46c16aca',
    'b2113f37d61d4b209f62e5058619d101',
    '7260e528909f45b08d7df85d99438207',
    '373da035df594057a352d5e4ebadf4de',
    'f00cb760a02342c787dc0bd8a5af4743',
    'a7b44370dffa47d4973096fa1a5c59c1',
    '95ff6649e4ac4b02b7ce60e281a352a7',
    'fc4f3eb1f4a845e0a2dd948a1c3a4f47',
    'eb2e915bdb124f0c8bd1258c04c2d808',
    'fc5c9660e96a499e911f5be0a7b66e7e',
    '6ebeddadc71b4a1690ddccde49fac0ff' */


//DARKSKY KEYS
/*     'f962475109da7278cd8ca1ba22186bee',
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
    '3f4148820c57f43f275b1d8a296997de',
    'fcb336d6821f83964f5ecab0c1f9e23c',
    'ae9a54c4c0ed2db9dc466a678cf30a2a',
    'ab46aec101761ea7b68ba0705dc34f2d',
    '62d4a930960e20b6052526d559aa66d5',
    'e53511be0246ba3b293c46438c5c87b2',
    '11124c5af6a2c801177e9b4cb0a51ea1',
    '0b83a2e09cdb64c70c7d278ab6df0fe7',
    '22c2f79fd3e4dd8d1a119ca5e1a1fdbd',
    '3e3a4e55d77d884b82c52b689b9f2279',
    '358bb3aa22da84b06abec68993e37b88',
    '4e3ebdd28f0754c767d7d51329d61f1e',
    'e457bdc33c858806f3380af830636b58' */
