const axios = require('axios')

//PARAMETERS
const NUM_DEVICES = 10
const temp_min = 10
const temp_max = 30
const freq = 30 //in minutes. Time interval from one value to another. 
               //Ex: there will be a time difference of 30 minutes in the timestamps of the first and second values
const interval = 7200 //number of minutes that the desired interval contains. EX: a year has 31536000 seconds, so if we want to generate data
                          //from a year ago interval=31536000
const VERTICAL = 'temperature'


async function timeout(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

async function axiostest(endpoint, data, method = 'post', url= 'http://localhost:8002') {
    const start = new Date();
    const res = await axios({
        method: method,
        url: url + endpoint,
        data: data,
        headers:{Authorization: axiostest.auth_token}
    })
    const end = new Date();
    //await timeout(500);
    return { ...res.data, delay: Number(end - start) + ' ms' }
}
axiostest.auth_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwib3JnIjoxLCJyb2xlIjoxfQ.gfP1aof0UA_Q6PY0B_rTFh_-pIp89jCGmeXu4jwytAM'

log = (...A) => console.log('\n', ...A)

async function generateValues(frequency,min,max,start=31536000){ //start default is the number of seconds in a year
    T = start * 1000 //milliseconds since the epoch
    frequency = frequency * 60 * 1000 //converting 'frequency' minutes to milliseconds
    values_available = 1 + T/frequency //number of values that will be generated for the given parameters
    
    const values = []
    const current_time = ((new Date()).getTime()) //in milliseconds
    for(var i in [...Array(values_available).keys()]){
        let value_timestamp = current_time-i*frequency
        let d = new Date()
        d.setTime(value_timestamp)
        value = {
            'id': 5000-i,
            'createdAt': value_timestamp,
            'fulldate': d,
            'data': Math.round(Math.random() * (max - min) + min)
        }
        values.push(value)
    }
    return values
}

const exec = (async function () {
    try {
        //Must be superuser because only he has permission to publish information
        superuserLoginRequest = {
            "username" : "superuser",
            "password" : "12345"
        }
        const superuserLoginResponse = await axiostest('/user/login',superuserLoginRequest)
        axiostest.auth_token = superuserLoginResponse.jwt; //authenticating
        log('Logging in as superuser', superuserLoginResponse)

        const limits = [-8.654981, -8.638642, 40.648018, 40.635610]
        let resources = []

        for (var i = 0; i < NUM_DEVICES; i++) {
            //Register device
            const registerDeviceRequest = {
                name: VERTICAL+"_Sensor_Test_" + (i + 1),
                owner: superuserLoginRequest.username,
                vertical: VERTICAL,
                location: (Math.random() * (limits[0] - limits[1]) + limits[1]) + ", " + (Math.random() * (limits[2] - limits[3]) + limits[3]),
                description: "This is a " + VERTICAL + " device"
            }
            const registerDeviceResponse = await axiostest('/device', registerDeviceRequest)
            log('Inserted device', registerDeviceResponse)

            //Add stream
            const addStreamRequest = { 
                stream : VERTICAL+"_stream_"+Math.floor(Math.random()*2000000),
                description: "My " + VERTICAL + " temperature stream",
                device_id: registerDeviceResponse._id,
                mobile: false,
                type: VERTICAL
            }
              
            const addStreamResponse = await axiostest(`/czb/stream`, addStreamRequest, "POST", "http://localhost:8001")
            log('Added stream', addStreamResponse)

            //Subscribe
            /*const subscribeRequest = {
                name: `Test ${Number(new Date())} subscription`,
                subscriber_id: registerDeviceResponse.id,
                stream_name: "example_stream",
                device_id: registerDeviceResponse.id,
                device_secret: "1234",
                description: "test subscription",
                state: "active",
                method: "pull"
            }
            const subscribeResponse = await axiostest(`/subscriptions_without_smartiot`, subscribeRequest)
            log('Added subscription', subscribeResponse)*/
            let deviceId = registerDeviceResponse._id
            resources.push({deviceId: {}})
        }
        console.log(resources)
        console.log("Publishing values...")

        // //Publish stream value
        let values = await generateValues(freq,temp_min,temp_max,interval)
        for(i in resources){
            const dev_id = resources[i].device

            //Publish into the device stream
            const stream_name = 'example_stream'
            for(i in values){
                const {data, fulldate} = values[i]
                const publishStreamValueRequest = {
                    data: data,
                    createdAt: fulldate,
                    receivedAt: fulldate,
                    id: (Math.round(Math.random()*2000000)).toString(),
                    streamId: stream_name,
                    subscriptionId: resources[i].sub,
                    resources:dev_id
                }
                const publishStreamValueResponse = await axiostest(`/push_data`, publishStreamValueRequest, 'post','http://localhost:8010')
                log(`Added stream_value ${data} into stream ${stream_name} from device ${dev_id}`, publishStreamValueResponse)
            }
        }

    } catch (error) {
        log('error', error.message)
        log('error', error.response.data)
    }
})()
