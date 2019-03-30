const { Kafka , logLevel} = require('kafkajs')

const localhost = process.env.HOST || '127.0.0.1'

// logger
const fixedLogs = logLevel => ({ namespace, level, label, log }) => {
    const { timestamp, logger, message, ...others } = log 
    console.log(`[${timestamp}] ${label} [${namespace}]: ${message} Failure: ${others.error}`)
}

const kafka = new Kafka({
  brokers: [`${localhost}:9090`, `${localhost}:9091`, `${localhost}:9092`, `${localhost}:9093`, `${localhost}:9094` ],
  logLevel: logLevel.ERROR,
  logCreator: fixedLogs
})

// kafka clients (admin, producer) 
const createConsumer = accountToken => {
    return kafka.consumer({ groupId: accountToken })
}

const consumeData = async (consumer, dataTypes) => {
    await consumer.connect()
    dataTypes.forEach(type => {
        await consumer.subscribe({ topic: type})
    });
}
