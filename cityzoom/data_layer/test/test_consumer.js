const consumer = require('../src/kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_temp'

const rcv = (arg) => {
    console.log('ptinting in main consumer ', arg)
}

var consumer_test = async (rcv, stream) => {
    try {
        const a = await consumer.readData(rcv, stream)
        console.log('e-', a)
    } catch (err) {
        console.log('err', err)
    }
    log(`Stream ${stream} read`)
}

consumer_test(rcv, stream)
