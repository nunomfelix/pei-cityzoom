const admin= require('../src/kafka-admin')

log = (...args) => console.log('\n', ...args)

// topics for types
const cr = (arg) => log(arg)
const stream = 't_temp'+Number(new Date())

var createStream_test = async (cr, stream) => {
    const res = await admin.createStream(cr, stream)
    await log(`Stream ${stream} created `, res)
}

var delete_test = async (stream) => {
    const res = await admin.deleteStream([stream])
    log(`Stream ${stream} deleted`, res)   
}

createStream_test(cr, stream)
setTimeout(() => createStream_test(cr, stream), 2000)
setTimeout(() => delete_test(stream), 4000)
setTimeout(() => process.exit(0), 5000)