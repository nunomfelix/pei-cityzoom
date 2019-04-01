const { createType }= require('../src/kafka-admin')
const producer = require('../src/kafka-producer')
const consumer = require('../src/kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_topic' + Number(new Date())

createType(stream)
    .then(e => log('Type ', type, ' created. Exit: ', e))
    .catch(e => log('Error', e))

// payload data to topic  
const payload = producer.genDataCreationPayload('user_1', stream, '20', Number(new Date()), [20, 20])
log('payload: ', payload)

producer.run(payload)
    .then(e => log('Data logged succesfully', e))
    .catch(e => console.error(JSON.parse(e)))
