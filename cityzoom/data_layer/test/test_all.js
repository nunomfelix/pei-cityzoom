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
    const recv = (arg) => console.log('Read message: ', arg)
    try {
        const a = await consumer.readData(recv, stream)
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
setTimeout(() => produce_test(stream), 2000)
setTimeout(() => {consumer_test(stream)}, 10000)
setTimeout(() => {delete_test(stream); setTimeout(() => process.exit(0), 1000)}, 50000)