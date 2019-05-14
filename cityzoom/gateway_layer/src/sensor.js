SockJs = require('sockjs-client')
WebSocket = require('ws')
StompJs = require('stompjs')
const axios = require('axios')

existing_streams = {
    "1" : false,
    "2" : false,
    "3" : false,
    "4" : false,
    "5" : false,
    "6" : false,
    "7" : false,
    "8" : false,
    "9" : false,
    "10": false,
    "11": false,
    "12": false,
    "13": false,
    "14": false,
    "15": false,
    "16": false,
    "18": false
}

sensors = {
    "1" : "TemperatureOut",
    "2" : "CO",
    "3" : "CH4",
    "4" : "NH3",
    "5" : "Pressure",
    "6" : "Humidity",
    "7" : "Altitude",
    "8" : "TemperatureIn",
    "9" : "UvIndex",
    "10": "CO2",
    "11": "Sound",
    "12": "WindSpeed",
    "13": "WindDirection",
    "14": "Lux",
    "15": "Precipitation",
    "16": "Coordinates",
    "18": "Velocity"
}

nodes = {
    "1"  : {"lat" : 40.638423, "long" : -8.643296},
    "2"  : {"lat" : 40.629010, "long" : -8.655393},
    "99" : {"lat" : 40.634590, "long" : -8.659564},
    "239": {"lat" : 40.634562, "long" : -8.659555},
    "213": {"lat" : 40.634252, "long" : -8.659870},
    "201": {"lat" : 40.633119, "long" : -8.659400}
}

var url = "http://mobiwise.vm.nap.av.it.pt:15082/mobiwise-websocket"
var client = new SockJs(url)

var stompClient = StompJs.over(client)
console.log("Created Client")

stompClient.connect('', () => {   
    stompClient.subscribe('/topic/last', (mes) => {
        if(mes.body){
            var data = JSON.parse(mes.body)
            for(i in data.sensors){
                var sensor_name = sensors[data.sensors[i].sensor_id]
                if(!existing_streams[data.sensors[i].sensor_id]){
                    existing_streams[data.sensors[i].sensor_id] = true
                    create_Stream(sensor_name, data.source.id)
                    console.log("Created stream stream_" + sensor_name)
                }
                var location = {"lat":nodes[data.source.id].lat, "long":nodes[data.source.id].long}
                put_Stream(sensor_name, data.sensors[i]['value'],location)
                console.log("Sent data to stream strea_" + sensor_name)
            }
        }
        else console.log("Error receiving the message")
    })   
}, (err) => { 
    console.log(err)
})

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

