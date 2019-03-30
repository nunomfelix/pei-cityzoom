const { createType }= require('./kafka-admin')
const producer = require('./kafka-producer')
const consumer = require('./kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types
var type = 'temperature_'+Number(new Date())

createType(type)
    .then(e => log('Type ', type, ' created. Exit: ', e))
    .catch(e => log('Error', e))

// payload data to topic n
var payload = {
  topic: type,
  messages: [
    {
        key: 'key0',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key0'}),
    },
    {
        key: 'key1',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key1'}),
    },
    {
        key: 'key2',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key2'}),
    },
    {
        key: 'key3',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key3'}),
    },
    {
        key: 'key4',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key4'}),
    },
    {
        key: 'key5',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key5'}),
    },
    {
        key: 'key6',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key6'}),
    },
    {
        key: 'key7',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key7'}),
    },
    {
        key: 'key8',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key8'}),
    },
    {
        key: 'key9',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key9'}),
    },
  ]
}

producer.run(payload)
    .then(e => log('Data logged succesfully', e))
    .catch(e => console.error(JSON.parse(e)))
