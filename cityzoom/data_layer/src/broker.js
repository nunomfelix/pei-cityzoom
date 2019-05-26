var mosca = require('mosca');
var colors = require('colors')
const config = require('config')
const clientDebug = require('debug')('broker:Client')
const pubDebug = require('debug')('broker:Publish')
const subDebug = require('debug')('broker:Subscribe')

var listener = {
  //using listener
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'pubsub',
  mongo: {}
};

var settings = {
  port: config.get('BROKER_PORT'),
  host: config.get('BROKER_HOST'),
  backend: listener
};

var server = new mosca.Server(settings);

//When a client connects to the broker
server.on('clientConnected', function(client) {
  clientDebug('Client connected: '+ colors.yellow(client.id));
});
 
//When a client disconnects to the broker
server.on('clientDisconnected', function(client) {
  clientDebug('Client disconnected: '+ colors.yellow(client.id));
});

// fired when a message is published
server.on('published', function(packet, client) {
  pubDebug('Client published in topic', colors.blue(packet.topic), 'payload',colors.red(packet.payload.toString('utf8')));
});

// fired when a topic is subscribed
server.on('subscribed', function(topic, client) {
  subDebug('Client', colors.yellow(client.id),'subscribed topic', colors.blue(topic));
});

// fired when a topic is subscribed
server.on('unsubscribed', function(topic, client) {
  subDebug('Client', colors.yellow(client.id),'unsubscribed topic', colors.blue(topic));
});

server.on('ready', setup);
 
// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running at '+settings.host+':'+settings.port);
}