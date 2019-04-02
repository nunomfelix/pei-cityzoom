const PERIOD = 10
const { readData } = require('./kafka-consumer')
const { Stream, Values } = require('./parser')

async function storeValueInDB(value) {
    const v = new Values(value)
    await v.save()
}

/*
    This function fetches the available values from all the streams in Kafka
    and stores them in the Long Term Persistence database
*/
async function fetch(PERIOD) {
    const streams = await Stream.find({})
    for (i in streams) {
        await readData(storeValueInDB, streams[i].name)
    }
}

module.exports = {
    fetch
}