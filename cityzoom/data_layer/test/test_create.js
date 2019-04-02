const admin= require('../src/kafka-admin')

log = (...args) => console.log('\n', ...args)

// topics for types
const stream = 't_temp'+Number(new Date())

var createStream_test = async stream => {
    const res = await admin.createStream(stream)
    log(`Stream ${stream} created `, res)
}

var delete_test = async stream => {
    const res = await admin.deleteStream([stream])
    log(`Stream ${stream} deleted`, res)   
}

createStream_test(stream)
delete_test(stream)