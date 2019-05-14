SockJs = require('sockjs-client')
WebSocket = require('ws')
StompJs = require('stompjs')


var url = "http://mobiwise.vm.nap.av.it.pt:15082/mobiwise-websocket"
var client = new SockJs(url)

var stompClient = StompJs.over(client)
console.log("Created Client")

stompClient.connect('', () => {   
    stompClient.subscribe('/topic/last', (mes) => {
        if(msg) console.log("Received msg: " + mes + ";")
        else console.log("kek")
    })   
}, (err) => { 
    console.log(err)
})
