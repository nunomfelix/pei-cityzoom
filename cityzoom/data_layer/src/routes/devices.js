const express = require('express')
const validators = require('../validation')
const { validation } = require('../middleware')
const devices = require('../db/models/devices')
const streams = require('../db/models/streams')
const subscriptions = require('../db/models/subscriptions')
const devicesDebug = require('debug')('app:Devices')

const router = new express.Router()

// create a device -- PASSING
router.post('', validation(validators.validateCreateDevice, 'body', 'Invalid device'), async (req, res) => {
    // convert request to broker-stuff
    devicesDebug('[DEBUG] Creating DEVICE')
    to_broker = {
        device_ID: req.body['device_ID'],
        device_name: req.body['device_name'],
        vertical: req.body['vertical'],
        mobile: req.body['mobile'],
        provider: req.body['provider'],
        created_at: Number(Date.now()),
        description: 'description' in req.body ? req.body.description : "",
        locations: []
    }
    /*
        * TODO
        * Implement the broker send request
        * While not implemented it will have a straight connection to mongoDB
        */

    // straight connection
    await devices.create(to_broker)
        .then(() => {
            devicesDebug('[DEBUG] Device created with success')
            return res.status(200).send({ 
                status: 'Creation successful',
                device_ID: req.body['device_ID'],
                device_name: req.body['device_name'],
                vertical: req.body['vertical'],
                mobile: req.body['mobile'],
                provider: req.body['provider'],
                created_at: Number(Date.now())
            })
        })
        .catch(() => {
            devicesDebug(`[Error] Device ${to_broker.device_ID} already exists`)
            return res.status(409).send({'Error':`Device ${to_broker.device_ID} already exists`}) 
        }
    )
})

// get all devices -- testing
router.get('', async (req, res) => {
    devicesDebug('[DEBUG] Fetching all Devices')
    var result = {}
    const start = req.query.interval_start ? req.query.interval_start : 0
    const compass = Number(Date.now())
    const end = req.query.interval_end ? req.query.interval_end : compass
    if (end < start || start < 0) {
        devicesDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }
    user_devs =[]
    var allDevices = await devices.find({created_at: { $gte: start, $lte: end}})

    for (var i = 0; i < allDevices.length; i++) {
        let doc = allDevices[i]
       
        // get all devices streams
        var allDeviceStreams = await streams.find({device_ID: doc.device_ID})
        devStreams = []
        await allDeviceStreams.forEach(function (stream) {
            devStreams.push(stream.stream_ID)
        })
       
        // get all devices subscriptions
        var allDeviceSubs = await subscriptions.find({device_ID: doc.device_ID})
        devSubs = []
        await allDeviceSubs.forEach( function (sub) {
            devSubs.push(sub.subscription_ID)
        })
        
        user_devs.push({
            device_ID: doc.device_ID,
            device_name: doc.device_name,
            mobile: doc.mobile,
            provider: doc.provider,
            created_at: Number(doc.created_at),
            vertical: doc.vertical,
            description: doc.description,
            locations: doc.locations,
            streams: devStreams,
            subscriptions: devSubs
        })
    }
    result['total_devices']
    await devices.countDocuments({created_at: { $gte: start, $lte: end}}, (err, count) => {
        result['total_devices'] = count 
    })
    devicesDebug('[DEBUG] Fetched with success')
    if (start != 0) { result['start'] = start }
    if (end != compass) { result['end'] = end }
    result['user_devices'] = user_devs
    
    res.status(200).send(result)
})

// get device by ID -- testing
router.get('/:id', async (req, res) => {
    const doc = await devices.findOne({device_ID:req.params.id})
    if (!doc) { return res.status(404).send({'Status':'Not Found'}) }
    // get all device streams
    var allDeviceStreams = await streams.find({device_ID: doc.device_ID})
        devStreams = []
        allDeviceStreams.forEach((stream) => {
            devStreams.push(stream.stream_ID)
        })

    // get all devices subscriptions
    var allDeviceSubs = await subscriptions.find({device_ID: doc.device_ID})
    devSubs = []
    await allDeviceSubs.forEach( function (sub) {
        devSubs.push(sub.subscription_ID)
    })

    res.status(200).send({
        device_ID: doc.device_ID,
        device_name: doc.device_name,
        mobile: doc.mobile,
        provider: doc.provider,
        created_at: Number(doc.created_at),
        vertical: doc.vertical,
        description: doc.description,
        locations: doc.locations,
        streams: devStreams,
        subscriptions: devSubs
    })
})

// delete device by ID -- PASSING
router.delete('/:id', async (req, res) => {
    const deletion = await devices.deleteOne({device_ID:req.params.id})
    if (deletion.deletedCount == 0) { return res.status(404).send({'Status':'Not Found'})}
    res.status(204).send()
})

module.exports = router