const { Kafka , logLevel} = require('kafkajs')
 
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['127.0.0.1:9092'],
  logLevel: logLevel.ERROR
})
 
// Producing
const producer = kafka.producer()

const pushData = async payload => {
  return producer.send(payload)
                 .then(console.log('Data logged into kafka'))
                 .catch(e => console.log('Error pushing data to kafka broker: ', e))
}

const run = async payload => {
  console.log('Connecting to kafka server...')
  await producer.connect()
  pushData(payload)
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

run(payload).catch(e => console.error(JSON.parse(e)))

module.exports = {
  runProd: run
}
