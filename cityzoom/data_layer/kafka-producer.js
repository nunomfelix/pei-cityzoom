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
  topic: 'temperature',
  messages: [
    {
        key: 'key0',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key0'}),
    },
    {
        key: 'key1',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key1'}),
    },
    {
        key: 'key2',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key2'}),
    },
    {
        key: 'key3',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key3'}),
    },
    {
        key: 'key4',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key4'}),
    },
    {
        key: 'key4',
        value: JSON.stringify({data: 'This message is in JSON data-type', key: 'key4'}),
    },
  ]
}

run(payload).catch(e => console.error(JSON.parse(e)))

