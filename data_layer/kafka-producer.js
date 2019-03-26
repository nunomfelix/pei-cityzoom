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
const producer = kafka.producer()
const admin = kafka.admin()

const createType = async type => {
    await admin.connect()
    await admin.createTopics({
        timeout: 30000,
        topics: [{
            topic: type,
            numPartitions: 5,
            replicationFactor: 4
        }]
    })
    await admin.disconnect()
}

const pushData = async payload => {
  return producer.send(payload)
                 .then(console.log('Data logged into kafka'))
                 .catch(e => console.log('Error pushing data to kafka broker: ', e))
}

const run = async payload => {
  console.log('Connecting to kafka server...')
  await producer.connect()
  pushData(payload).catch(e => console.error(JSON.parse(e)))
  await producer.disconnect()
}

var payload = {
  topic: 'topic1',
  messages: [
    {
      key: 'key1',
      value: JSON.stringify({data: 'This message is in JSON data-type'}),
      partition: 0
    },
    {
      key: 'key1',
      value: JSON.stringify({data: 'This message is in partition 0'}),
      partition: 0
    },
    {
      key: 'key2',
      value: JSON.stringify({data: 'This message is in partition 2'}),
      partition: 2
    }
  ]
}

createType('temperature')
//run(payload).catch(e => console.error(JSON.parse(e)))

