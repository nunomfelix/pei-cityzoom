const consume = require('./kafka-consumer')
const produce = require('./kafka-producer')
const 
const yargs = require('yargs')
const _ = require('lodash')

var streamOptions = {
    describe: 'Name of stream',
    demand: true,
    alias: 's'
}

var payloadOptions = {
    describe: 'Payload of values',
    demand: true,
    alias: 'p'
}

const argv = yargs
    .command('read', 'read data from a stream', {
        stream: streamOptions
    })
    .command('put', 'put data from a stream', {
        stream: streamOptions,
        payload: payloadOptions
    })
    .help()
    .argv;

var command = argv._[0];

if (command === 'read') {
    



} else if (command === 'put') {

} else {
    console.log('Bad command')
}