const { createType }= require('./kafka-admin')
const producer = require('./kafka-producer')
const consumer = require('./kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types

var type = 'temperature_'+Number(new Date())

createType(type)
    .then(e => log('Type ', type, ' created. Exit: ', e))
    .catch(e => log('Error', e))
