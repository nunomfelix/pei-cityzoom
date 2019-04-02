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

const readData = async stream_name => {
  new Promise((resolve, reject) => {
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
        console.log(`- ${prefix} ${message.key}#${message.value}`)
        resolve(`- ${prefix} ${message.key}#${message.value}`)
      },
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

//console.log('stream: t_topic1554163799665', '\n')
//run('t_topic1554163799665').catch(e => console.error(`[example/consumer] ${e.message}`, e))

// 
// const errorTypes = ['unhandledRejection', 'uncaughtException']
// const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
// 
// errorTypes.map(type => {
//   process.on(type, async e => {
//     try {
//       console.log(`process.on ${type}`)
//       console.error(e)
//       await consumer.disconnect()
//       process.exit(0)
//     } catch (_) {
//       process.exit(1)
//     }
//   })
// })
// 
// signalTraps.map(type => {
//   process.once(type, async () => {
//     try {
//       await consumer.disconnect()
//     } finally {
//       process.kill(process.pid, type)
//     }
//   })
// })



// // createConsumer (String accountName)
// const createConsumer = accountName => {
//     return kafka.consumer({ groupId: accountName })
// }
// 
// // consumeData(kafka.consumer consumer, String topic) 
// const consumeData = async (consumer, topic) => {
//     await consumer.connect()
//         .then(e => console.log('Connected to kafka'))
//         .catch(e => console.log('Failed to connect to kafka, ', e))
//     await consumer.subscribe({ topic })
//         .then(e=> console.log(`Subscribed to topic ${topic} successfully`))
//         .catch(e => console.log(`Error: Topic ${topic} does not exist`, e))
//     await consumer.run({
//         // eachBatch: async ({ batch }) => {
//         //   console.log(batch)
//         // },
//         eachMessage: async ({ topic, partition, message }) => {
//         const prefix = `1 ${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
//         console.log(`- ${prefix} ${message.key}#${message.value}`)
//         },
//     })
//         .then(e => console.log('Succesfull'))
//         .catch(e => console.log('Error: running', e))
// 
//     
//     // await consumer.connect()
//     // dataTypes.forEach(type => {
//     //     consumer.subscribe({ topic: type})
//     //         .catch()
//     // });
//     // await consumer.run({
//     //     eachMessage: async ({ topic, partition, message }) => {
//     //         console.log({
//     //             topic: topic,
//     //             key: message.key.toString(),
//     //             value: message.value.toString(),
//     //             headers: message.headers,
//     //         })
//     //     },
//     // })
// }
// 
// const consumer = createConsumer(2)
// consumeData(consumer, 'temp1')