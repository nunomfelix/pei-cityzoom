const { Kafka, logLevel } = require('kafkajs')

const localhost = process.env.HOST || '127.0.0.1'

// logger
const fixedLogs = logLevel => ({ namespace, level, label, log }) => {
  const { timestamp, logger, message, ...others } = log
  console.log(`{ERROR GENERATED @ KAFKA-CONSUMER} [${timestamp}] ${label} [${namespace}]: ${message} Failure: ${others.error}`)
}

const kafka = new Kafka({
  brokers: [`${localhost}:9090`, `${localhost}:9091`, `${localhost}:9092`, `${localhost}:9093`, `${localhost}:9094`],
  logLevel: logLevel.ERROR,
  logCreator: fixedLogs
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const readData = async (receiver, stream_name) => {
  return new Promise((resolve, reject) => {
    consumer.connect()
    consumer.subscribe({ topic: stream_name })
      .catch(e => {
        console.log(stream_name)
        console.log('failed to subscribe to topic')
        console.log('err: ', e)
        reject(e)
      })
    consumer.run({
      eachMessage: async ({ topic, message }) => {
        console.log(`- ${topic} ${message.timestamp} ${message.key}#${message.value}`)
        receiver(`- ${topic} ${message.timestamp} ${message.key}#${message.value}`)
        resolve('ok')
      }
    })
      .then(e => {
        console.log('reading')
        resolve('read')
      })
      .catch(e => {
        console.log('fucked up', e)
        reject('fail')
      })
    setTimeout(() => {
      console.log('egging')
      return 0
    }, 10000)
  })
}

module.exports = {
  readData
}
