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

// kafka admin
const admin = kafka.admin()

const createType = async stream_name => {

    var created = false;
    await admin.connect()
                .then(console.log('Connection to kafka established succesfully'))
    await admin.createTopics({
        timeout: 30000,
        topics: [{
            topic: stream_name,
            numPartitions: 5,
            replicationFactor: 2
        }]
    })
      .then(e => {
          console.log(`Topic ${stream_name} ` + ( e ? 'created' : 'already exists!' ))
          created = e
      })
      .catch(e => console.log(`Error @ creating topic ${type}, exit status: ${e}`))
    admin.disconnect()
    return created;
}

//var topic_to_create = 'temperature_'+Number(new Date())
//
//createType('temp')
//     .then(e => console.log('Topic ', topic_to_create, ' created: ', e))
//     .catch(e => console.log('Error creating topic: ', e))

module.exports = {
  createType,
  admin
}