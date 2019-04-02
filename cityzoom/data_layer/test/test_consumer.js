const consumer = require('../src/kafka-consumer')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_temp'

var consumer_test = async stream => {
    try {
        const a = await consumer.readData(stream)
        console.log('e-', a)
    } catch (err) {
        console.log('err', err)
    }
    log(`Stream ${stream} read`)
}

consumer_test(stream)
