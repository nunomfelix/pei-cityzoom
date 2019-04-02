const admin= require('../src/kafka-admin')
const producer = require('../src/kafka-producer')
const consumer = require('../src/kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_temp'
const stream_2 = 't_topic'+Number(new Date())

var createStream_test = async stream => {
    const res = await admin.createStream(stream)
    log(`Stream ${stream} created `, res)
}

var produce_test = async stream => {
    const payload = producer.genDataCreationPayload('user_1', stream, 20, Number(new Date()), [20, 20])
    log('payload: ', payload)

    const res = await producer.putData(payload)
    log('Data logged succesfully ', res)
}

var delete_test = async stream => {
    const res = await admin.deleteStream([stream])
    log(`Stream ${stream} deleted`, res)   
}

var consumer_test = async stream => {
    try {
        const a = await consumer.readData(stream)
    } catch (err) {
        console.log('err', err)
    }
    log(`Stream ${stream} read`)
}

//admin.createStream(stream)
//    .then(e => log("It's ", e, //e ? 'bad':'good'))
//    .catch(e => log('Error', e)//)

//admin.deleteStream([stream])
//    .then(e => log("It's ", e, e ? 'bad':'good'))
//    .catch(e => log('Error', e))
// payload data to topic  
//const payload = producer.genDataCreationPayload('user_1', 't_topic1554163799665', '20', Number(new Date()), [20, 20])
//log('payload: ', payload)
//
//producer.run(payload)
//    .then(e => log('Data logged succesfully', e))
//    .catch(e => console.error(JSON.parse(e)))

// consumer.run(stream)
//     .then(e => console.log('Data consumed!', e))
//     .catch(e => console.error(`[example/consumer] ${e.message}`, e))

//createStream_test(stream)
//produce_test(stream)
consumer_test(stream)
//delete_test(stream_2)