const producer = require('../src/kafka-producer')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_temp'

var produce_test = async stream => {
    const payload = producer.genDataCreationPayload('user_1', stream, 20, Number(new Date()), [20, 20])
    log('payload: ', payload)

    const res = await producer.putData(payload)
    log('Data logged succesfully ', res)
}

produce_test(stream)
