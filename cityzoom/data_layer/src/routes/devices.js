const express = require('express')
const {validateCreateDevice} = require('../validation')
const { validation } = require('../middleware')
const devicesDebug = require('debug')('app:Devices')
const devices = require('../db/models/devices')
const values = require('../db/models/values')
//Broker producer and consumer
const producer = require('../producer')

const router = new express.Router()

// create a device
router.post('', validation(validateCreateDevice, 'body', 'Invalid device'), async (req, res) => {
    // convert request to broker-stuff
    const to_broker = {
        ...req.body,
        created_at: Number(Date.now()), 
        location: []
    }
    
    //Publishes the device in the broker
    const wasPublished = await producer.publish('cityzoom/devices',to_broker)
    if(!wasPublished){
        devicesDebug(`Device ${to_broker.device_ID} already exists`)
        return res.status(409).send({'Error':`Device ${to_broker.device_ID} already exists`}) 
    }

    return res.status(201).send({ 
        status: 'Creation successful',
        device_ID: req.body['device_ID'],
        device_name: req.body['device_name'],
        mobile: req.body['mobile'],
        provider: req.body['provider'],
        created_at: Number(Date.now())
    })
})

// get all devices
router.get('', async (req, res) => {
    devicesDebug('[DEBUG] Fetching all Devices')
    var allDevices = await devices.find({})
    res.status(200).send(allDevices)
})

router.get("/location", async(req,res) => {
    devicesDebug('[DEBUG] Fetching last device locations')
    const tmp = await devices.aggregate([
        {
            $match: {
                mobile: true,
		        timestamp: { $gte: 0 } 
            },
        },
        {
            $project: {
                location: 1,
                device_ID: 1
            }
        }
    ])
    console.log("HERE", tmp)
    res.send(tmp)
})

// get device by ID
router.get('/:id', async (req, res) => {
    const doc = await devices.findOne({device_ID:req.params.id})
    if (!doc) { return res.status(404).send({'Status':'Not Found'}) }
    // get all device streams
    var allDeviceStreams = await streams.find({device_ID: doc.device_ID})
    devStreams = []
    allDeviceStreams.forEach((stream) => {
        devStreams.push(stream.stream_ID)
    })

    res.status(200).send({
        device_ID: doc.device_ID,
        device_name: doc.device_name,
        mobile: doc.mobile,
        provider: doc.provider,
        created_at: Number(doc.created_at),
        verticals: doc.verticals,
        description: doc.description,
        locations: doc.locations,
        streams: devStreams
    })
})

// delete device by ID
router.delete('/:id', async (req, res) => {
    const deletion = await devices.deleteOne({device_ID:req.params.id})
    if (deletion.deletedCount == 0) { return res.status(404).send({'Status':'Not Found'})}
    res.status(204).send()
})

// get values by stream
router.get('/:id/values', async (req,res) => {
    const device = await devices.findOne({device_ID:req.params.id})

    console.log(device)
    if (!device) { return res.status(404).send({'Status':'Not found'})}
    var start = req.query.interval_start ? Number(req.query.interval_start) : Number(new Date(0))
    var end = req.query.interval_end ? Number(req.query.interval_end) : Number(new Date())
    console.log(start)
    console.log(end)
    if (end < start || start < 0) {
        streamsDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }

    var before = new Date()
    const tmp = await values.aggregate([{
        $match:{
            device_ID: device.device_ID
            //$and: [{created_at: {$gte: start}},{created_at: {$lt: end}}]
        }
    },{
        $group:{
            _id: "$stream_name",
            values: {
                $push: {
                    timestamp: "$timestamp",
                    value: "$value",
                    longitude: "$longitude",
                    latitude: "$latitude"
                }
            }
        }
    }])
    console.log('este ')
    console.log(tmp)
    console.log('\n\n')
    var after = new Date()

    console.log(after-before)
    res.send(tmp)
})


module.exports = router
