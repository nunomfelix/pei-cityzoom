const admin= require('../src/kafka-admin')
const producer = require('../src/kafka-producer')
const consumer = require('../src/kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_temp'+Number(new Date())

const createStream_test = async stream => {
    const res = await admin.createStream(stream)
    log(`Stream ${stream} created `, res)
}

const produce_test = async stream => {
    const payload = producer.genDataCreationPayload('user_1', stream, 20, Number(new Date()), [20, 20])
    log('payload: ', payload)

    const res = await producer.putData(payload)
    log('Data logged succesfully ', res)
}

const consumer_test = async stream => {
    try {
        const a = await consumer.readData(stream)
    } catch (err) {
        console.log('err', err)
    }
    log(`Stream ${stream} read`)
}

const delete_test = async stream => {
    const res = await admin.deleteStream([stream])
    log(`Stream ${stream} deleted`, res)   
}

createStream_test(stream)
produce_test(stream)
setTimeout(() => {consumer_test(stream)}, 2000)
setTimeout(() => {delete_test(stream)}, 50000)