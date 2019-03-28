const kafka = require('kafka-node')

const Producer = kafka.Producer
const KeyedMessage = kafka.KeyedMessage
const client = new kafka.KafkaClient()
const producer = new Producer(client)
const km = new KeyedMessage('key', 'message')

var topicsToCreate = [{
  topic: 'topic1',
  partitions: 1,
  replicationFactor: 2
},
{
  topic: 'topic2',
  partitions: 5,
  replicationFactor: 3,
  // Optional set of config entries
  configEntries: [
    {
      name: 'compression.type',
      value: 'gzip'
    },
    {
      name: 'min.compaction.lag.ms',
      value: '50'
    }
  ],
  // Optional explicit partition / replica assignment
  // When this property exists, partitions and replicationFactor properties are ignored
  replicaAssignment: [
    {
      partition: 0,
      replicas: [3, 4]
    },
    {
      partition: 1,
      replicas: [2, 1]
    }
  ]
}];
 
client.createTopics(topicsToCreate, (error, result) => {
  // result is an array of any errors if a given topic could not be created
});


var payloads = [
  { topic: 'topic1', messages: 'hi', partition: 0 },
  { topic: 'topic2', messages: ['hello', 'world', km], partition: 0 }
];

producer.on('ready', function () {
  producer.send(payloads, function (err, data) {
    if (err) {
      console.error('error: ', err)
    } else {
      console.log('data: ', data);
    }
  });
});
