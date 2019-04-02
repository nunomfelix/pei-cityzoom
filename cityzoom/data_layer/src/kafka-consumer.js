const { Kafka , logLevel} = require('kafkajs')

const localhost = process.env.HOST || '127.0.0.1'

// logger
const fixedLogs = logLevel => ({ namespace, level, label, log }) => {
    const { timestamp, logger, message, ...others } = log 
    console.log(`{ERROR GENERATED @ KAFKA-CONSUMER} [${timestamp}] ${label} [${namespace}]: ${message} Failure: ${others.error}`)
}

const kafka = new Kafka({
  brokers: [`${localhost}:9090`, `${localhost}:9091`, `${localhost}:9092`, `${localhost}:9093`, `${localhost}:9094` ],
  logLevel: logLevel.ERROR,
  logCreator: fixedLogs
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const readData = async (receiver, stream_name) => {
  return new Promise((resolve, reject) => {
    consumer.connect()
    console.log(stream_name)
    consumer.subscribe({ topic: stream_name })
        .catch(e => {
          console.log('failed to subscribe to topic', stream_name)
          console.log('err: ', e)
          reject(e)
        })
    consumer.run({
      // eachBatch: async ({ batch }) => {
      //   /* TO DO:
      //    *  -> stop consumer after a certain amount of time 
      //    *  -> send the last committed offset to data layer database
      //    *  -> send the batch to data layer with the offset 
      //   */
      //   console.log(`${batch.messages}`)
      // },
      eachMessage: async ({ topic, partition, message }) => {
        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
        //console.log(`- ${prefix} ${message.key}#${message.value}`)
        receiver(`- ${prefix} ${message.key}#${message.value}`)
        resolve('ok')
      }
    })
      .then(e => {
        console.log('reading')
        resolve('read')
      })
      .catch(e => {
        console.log('fudeu a ler', e)
        reject('fail')
      })
  })
  setTimeout(() => {
    console.log('egging')
    process.exit(0)
  }, 10000)
}


// const stream = 'stream_' + Number(new Date())
module.exports = {
  readData
}
