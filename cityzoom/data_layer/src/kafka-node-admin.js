var kafka = require('kafka-node');
var client = new kafka.KafkaClient({kafkaHost: 'localhost:9090,localhost:9091,localhost:9092,localhost:9093,localhost:9094'});
var admin = new kafka.Admin(client) 

var topicsToCreate = [{
  topic: 'topic1',
  partitions: 1,
  replicationFactor: 2
},
{
  topic: 'topic2',
  partitions: 5,
  replicationFactor: 3
}];
 
var topics = admin.createTopics(topicsToCreate, (error, result) => {
    console.log('err: ', error, '\nres: ', result)
});

console.log(topics)
 