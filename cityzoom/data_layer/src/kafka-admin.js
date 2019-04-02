const { Kafka , logLevel} = require('kafkajs')

const localhost = process.env.HOST || '127.0.0.1'

// logger
const fixedLogs = logLevel => ({ namespace, level, label, log }) => {
    const { timestamp, logger, message, ...others } = log 
    console.log(`{ERROR GENERATED @ KAFKA-ADMIN} [${timestamp}] ${label} [${namespace}]: ${message} Failure: ${JSON.parse(others)}`)
}

const kafka = new Kafka({
  brokers: [`${localhost}:9090`, `${localhost}:9091`, `${localhost}:9092`, `${localhost}:9093`, `${localhost}:9094` ],
  logLevel: logLevel.ERROR,
  logCreator: fixedLogs
})

// kafka admin
const admin = kafka.admin()
const createStream = async (stream_name) => {
  return new Promise((resolve, reject) => {
    var createdTopic;
    admin.connect()
          .then(() => {
            admin.createTopics({
              timeout: 30000,
              topics: [{
                  topic: stream_name,
                  numPartitions: 5,
                  replicationFactor: 2
              }],
              waitForLeaders: true
            })
              .then(e => {
                console.log('admin: ', e)
                if (e) {
                  resolve(true)
                  console.log('Topic created')
                } else {
                  resolve(false)
                  console.log('Topic already created')
                }
                resolve(createdTopic)
              })
              .catch(e => {
                console.log('Exited kafka Successfully');
                resolve(false)
                admin.disconnect()
                reject(false)
              })            
          })
          .catch(e => {
            console.log('err: ', e)
            console.log('Can\'t connect to kafka')      
            reject(false)
          })
    resolve(createdTopic)
  })
}
const deleteStream = async stream_name => {
  return new Promise((resolve, reject) => {
    var deleteTopic = true;
    admin.connect()
                .then(() => {
                  admin.deleteTopics({
                    topics: stream_name,
                    timeout: 1000
                  })
                    .then(e => {
                      if (e) {
                        console.log(`Topic ${stream_name} deleted`)
                      }
                      deleteTopic = e;
                    })
                    .catch(e => {
                      admin.disconnect()
                        .then(console.log('Exited kafka successfully'))      
                      reject(e)
                    })
                })
                .catch(e => {
                  console.log('Can\'t connect to kafka')      
                  reject(e)
                })
    resolve(deleteTopic)
  })
}

module.exports = {
  createStream,
  deleteStream,
  admin
}