const express = require('express')
const validators = require('../validation')
const { validation } = require('../middleware')
const devices = require('../db/models/devices')
const streams = require('../db/models/streams')
const subscriptions = require('../db/models/subscriptions')
const values = require('../db/models/values')
const subscriptionsDebug = require('debug')('app:Subscriptions')

const router = new express.Router()

// create a streams -- PASSING
router.post('', validation(validators.validateCreateSubscription, 'body', 'Invalid stream'), async (req, res) => {
    // convert request to broker-stuff
    subscriptionsDebug('[DEBUG] Creating subscription')
    to_broker = {
        device_ID: req.body['device_ID'],
        stream_ID: req.body['stream_ID'],
        subscription_ID: req.body.subscription_ID,
        subscription_name: req.body.subscription_name,
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
            subsDebug(`[ERROR] Device ${to_broker.device_ID} not found`)
            return res.status(404).send({'Error':`Device ${to_broker.device_ID} not found`})
        }
    })
    subscriptionsDebug(`[DEBUG] Device ${to_broker.device_ID} exists`)
    await streams.countDocuments({stream_ID:to_broker.stream_ID}, (err, count) => {
        if (count == 0){
            subscriptionsDebug(`[ERROR] Stream ${to_broker.stream_ID} not found`)
            return res.status(404).send({'Error':`Stream ${to_broker.stream_ID} not found`})
        }
    })
    subscriptionsDebug(`[DEBUG] Stream ${to_broker.stream_ID} exists`)
         
    await subscriptions.create(to_broker)
        .then(() => {
            subscriptionsDebug('[DEBUG] Subscription created with success')
            return res.status(200).send({ 
                status: 'Creation successful',
                subscription_ID: req.body.subscription_ID,
                stream_ID: req.body.stream_ID,
                device_ID: req.body.device_ID,
                subscription_name: req.body.subscription_name,
                created_at: Number(Date.now())
            })
        })
        .catch(() => {
            subscriptionsDebug(`[Error] Subscription ${to_broker.subscription_ID} already exists`)
            return res.status(409).send({'Error':`Subscription ${to_broker.subscription_ID} already exists`}) 
        }
    )
})

// get all streams -- PASSING
router.get('', async (req, res) => {
    subscriptionsDebug('[DEBUG] Fetching all Subscriptions')
    var result = {}
    const start = req.query.interval_start ? req.query.interval_start : 0
    const compass = Number(Date.now())
    const end = req.query.interval_end ? req.query.interval_end : compass
    console.log(req.query.interval_end)
    if (end < start || start < 0) {
        devicesDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }
    user_subs = []
    var allSubs = await subscriptions.find({created_at: { $gte: start, $lte: end}})
    allSubs.forEach((doc) => {
        user_subs.push({
            subscription_ID: doc.subscription_ID,
            device_ID: doc.device_ID,
            stream_ID: doc.stream_ID,
            stream_name: doc.stream_name,
            created_at: Number(doc.created_at),
            description: doc.description
        })
    })
    result['total_subscriptions']
    await subscriptions.countDocuments({created_at: { $gte: start, $lte: end}}, (err, count) => {
        result['total_subscriptions'] = count 
    })
    subscriptionsDebug('[DEBUG] Fetched with success')
    if (start != 0) { result['start'] = start }
    if (end != compass) { result['end'] = end }
    result['user_subscriptions'] = user_subs
    
    res.status(200).send(result)
})

// get stream by ID -- PASSING
router.get('/:id', async (req, res) => {
    console.log(req.params.id)
    const doc = await subscriptions.findOne({subscription_ID:req.params.id})
    if (!doc) { return res.status(404).send({'Status':'Not Found'}) }
    res.status(200).send({
        subscription_ID: doc.subscription_ID,
        device_ID: doc.device_ID,
        stream_ID: doc.stream_ID,
        stream_name: doc.stream_name,
        created_at: Number(doc.created_at),
        description: doc.description
    })
})

// delete streams by ID -- PASSING
router.delete('/:id', async (req, res) => {
    const deletion = await subscriptions.deleteOne({subscription_ID:req.params.id})
    if (deletion.deletedCount == 0) { return res.status(404).send({'Status':'Not Found'})}
    res.status(204).send()
})

// get all values from subscription -- PASSING
router.get('/:id/values', async (req, res) => {
    subscriptionsDebug('[DEBUG] Fetching all subscription values')
    const start = req.query.interval_start ? req.query.interval_start : 0
    const compass = Number(Date.now())
    const end = req.query.interval_end ? req.query.interval_end : compass
    console.log(req.query.interval_end)
    if (end < start || start < 0) {
        devicesDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }
    await subscriptions.countDocuments({subscription_ID:req.params.id}, (err, count) => {
        if (count == 0){
            subsDebug(`[ERROR] Subscription ${req.params.id} not found`)
            return res.status(404).send({'Error':`Subscription ${req.params.id} not found`})
        }
    })
    subscriptionsDebug(`[DEBUG] Subscription ${req.params.id} exists`)
    sub_vals = []
    var allValues = await values.find({subscription_ID: {$eq : req.params.id}, created_at: { $gte: start, $lte: end}})
    allValues.forEach((doc) => {
        sub_vals.push({
            "value": doc.value,
            "timestamp": doc.created_at,
            "latitude": doc.latitude,
            "longitude": doc.longitude
        })
    })
    subscriptionsDebug('[DEBUG] Fetched with success')
    
    res.status(200).send(sub_vals)
})

// post value to device
router.post('/:id/values', validation(validators.validatePostValue, 'body', 'Invalid value'), async (req, res) => {
    subscriptionsDebug('[DEBUG] Creating Value')
    to_broker = {
        value: req.body.value,
        subscription_ID: req.params.id,
        timestamp: Number(Date.now()),
        latitude: req.body.latitude,
        longitude: req.body.longitude
    }
    /*
        * TODO
        * Implement the broker send request
        * and storing logic (firstly you add a location to the sensor if needed, then you store the value)
        * While not implemented it will have a straight connection to mongoDB
        */

    // straight connection
    await subscriptions.countDocuments({subscription_ID:to_broker.subscription_ID}, (err, count) => {
        if (count == 0){
            subscriptionsDebug(`[ERROR] Subscription ${to_broker.subscription_ID} not found`)
            return res.status(404).send({'Error':`Subscription ${to_broker.subscription_ID} not found`})
        }
    })
    subscriptionsDebug(`[DEBUG] Subscription ${to_broker.subscription_ID} exists`)
    
    const sub = await subscriptions.findOne({subscription_ID:to_broker.subscription_ID})
    let dev = await devices.findOne({device_ID:sub.device_ID}) 
    if (dev.mobile || ( !dev.mobile && dev.locations.length == 0)) {
        subscriptionsDebug(`[DEBUG] Updating ${sub.device_ID} location`)
        await devices.updateOne({device_ID:sub.device_ID}, {$push: {locations: {timestamp: to_broker.timestamp, latitude: to_broker.latitude, longitude: to_broker.longitude}}})
    } 

    await values.create(to_broker)
        .then(() => {
            subscriptionsDebug('[DEBUG] Value created with success')
            return res.status(204).send()
        })
})

module.exports = router
