const express = require('express')
const validators = require('../validation')
const { validation } = require('../middleware')
const devices = require('../db/models/devices')
const streams = require('../db/models/streams')
const subscriptions = require('../db/models/subscriptions')
const streamsDebug = require('debug')('app:Streams')

const router = new express.Router()

// create a streams -- PASSING
router.post('', validation(validators.validateCreateStream, 'body', 'Invalid stream'), async (req, res) => {
    // convert request to broker-stuff
    streamsDebug('[DEBUG] Creating streams')
    to_broker = {
        device_ID: req.body['device_ID'],
        stream_ID: req.body['stream_ID'],
        stream_name: req.body['stream_name'],
        type: req.body['type'],
        description: 'description' in req.body ? req.body.description : "",
        created_at: Number(Date.now())
    }
    /*
        * TODO
        * Implement the broker send request
        * While not implemented it will have a straight connection to mongoDB
        */

    // straight connection
    await devices.countDocuments({device_ID:to_broker.device_ID}, (err, count) => {
        if (count == 0){
            streamsDebug(`[ERROR] Device ${to_broker.device_ID} not found`)
            return res.status(404).send({'Error':`Device ${to_broker.device_ID} not found`})
        }
    })
    streamsDebug(`[DBUG] Device ${to_broker.device_ID} exists`)
         
    await streams.create(to_broker)
        .then(() => {
            streamsDebug('[DEBUG] Stream created with success')
            return res.status(200).send({ 
                status: 'Creation successful',
                stream_ID: req.body['stream_ID'],
                stream_name: req.body['stream_name'],
                created_at: Number(Date.now())
            })
        })
        .catch(() => {
            streamsDebug(`[Error] Streams ${to_broker.stream_ID} already exists`)
            return res.status(409).send({'Error':`Streams ${to_broker.stream_ID} already exists`}) 
        }
    )
})

// get all streams -- PASSING
router.get('', async (req, res) => {
    streamsDebug('[DEBUG] Fetching all Streams')
    var result = {}
    const start = req.query.interval_start ? req.query.interval_start : 0
    const compass = Number(Date.now())
    const end = req.query.interval_end ? req.query.interval_end : compass
    console.log(req.query.interval_end)
    if (end < start || start < 0) {
        devicesDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }
    user_streams = []
    var allStreams = await streams.find({created_at: { $gte: start, $lte: end}})
    allStreams.forEach(async (doc) => {
        // get all streams subscriptions
        var allStreamSubs = await subscriptions.find({stream_ID: doc.stream_ID})
        streamSubs = []
        await allStreamSubs.forEach( function (sub) {
            streamSubs.push(sub.subscription_ID)
        })
 
        user_streams.push({
            device_ID: doc.device_ID,
            stream_ID: doc.stream_ID,
            stream_name: doc.stream_name,
            created_at: Number(doc.created_at),
            type: doc.type,
            description: doc.description,
            subscriptions: streamSubs
        })
    })
    result['total_streams']
    await streams.countDocuments({created_at: { $gte: start, $lte: end}}, (err, count) => {
        result['total_streams'] = count 
    })
    streamsDebug('[DEBUG] Fetched with success')
    if (start != 0) { result['start'] = start }
    if (end != compass) { result['end'] = end }
    result['user_streams'] = user_streams
    
    res.status(200).send(result)
})

// get stream by ID -- PASSING
router.get('/:id', async (req, res) => {
    const doc = await streams.findOne({stream_ID:req.params.id})
    if (!doc) { return res.status(404).send({'Status':'Not Found'}) }
    // get all streams subscriptions
    var allStreamSubs = await subscriptions.find({stream_ID: req.params.id})
    streamSubs = []
    await allStreamSubs.forEach( function (sub) {
        streamSubs.push(sub.subscription_ID)
    })

    res.status(200).send({
        device_ID: doc.device_ID,
        stream_ID: doc.stream_ID,
        stream_name: doc.stream_name,
        created_at: Number(doc.created_at),
        type: doc.type,
        description: doc.description,
        subscriptions: streamSubs
    })
})

// delete streams by ID -- PASSING
router.delete('/:id', async (req, res) => {
    const deletion = await streams.deleteOne({stream_ID:req.params.id})
    if (deletion.deletedCount == 0) { return res.status(404).send({'Status':'Not Found'})}
    res.status(204).send()
})

module.exports = router