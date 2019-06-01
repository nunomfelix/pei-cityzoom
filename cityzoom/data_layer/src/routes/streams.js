const express = require('express')
const validators = require('../validation')
const { validation } = require('../middleware')
const devices = require('../db/models/devices')
const streams = require('../db/models/streams')
const values = require('../db/models/values')
const Hexagons = require('../db/models/hexagons')
const Muns = require('../db/models/municipalities')
const streamsDebug = require('debug')('app:Streams')
//Broker connection
const producer = require('../producer')

const router = new express.Router()

// create a streams
router.post('', validation(validators.validateCreateStream, 'body', 'Invalid stream'), async (req, res) => {
    // convert request to broker-stuff
    streamsDebug('[DEBUG] Creating streams')
    const to_broker = {
        device_ID: req.body['device_ID'],
        stream_ID: req.body['stream_ID'],
        stream_name: req.body['stream_name'],
        description: 'description' in req.body ? req.body.description : "",
        created_at: Number(Date.now())
    }
    
    // Checks if the specified device exists
    const count = await devices.countDocuments({device_ID:to_broker.device_ID})
    if (count == 0){
        streamsDebug(`Device ${to_broker.device_ID} not found`)
        return res.status(404).send({'Error':`Device ${to_broker.device_ID} not found`})
    }
    
    //Publishes the stream in the broker
    const wasPublished = await producer.publish('cityzoom/streams',to_broker)
    if(!wasPublished){
        streamsDebug(`[Error] Stream ${to_broker.stream_ID} already exists`)
        return res.status(409).send({'Error':`Streams ${to_broker.stream_ID} already exists`}) 
    }
    
    return res.status(200).send({ 
        status: 'Creation successful',
        stream_ID: req.body['stream_ID'],
        stream_name: req.body['stream_name'],
        created_at: Number(Date.now())
    })
})

// get all streams
router.get('', async (req, res) => {
    streamsDebug('[DEBUG] Fetching all Streams')
    var result = {}
    const start = req.query.interval_start ? req.query.interval_start : 0
    const compass = Number(Date.now())
    const end = req.query.interval_end ? req.query.interval_end : compass
    if (end < start || start < 0) {
        devicesDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }
    user_streams = []
    var allStreams = await streams.find({created_at: { $gte: start, $lte: end}})
    allStreams.forEach(async (doc) => { 
        user_streams.push({
            device_ID: doc.device_ID,
            stream_ID: doc.stream_ID,
            stream_name: doc.stream_name,
            created_at: Number(doc.created_at),
            description: doc.description
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

router.get('/heatmap', async (req, res) => {
    streamsDebug('[DEBUG] Fetching all stream values')
    var start = req.query.interval_start ? req.query.interval_start : Number(new Date(0))
    var end = req.query.interval_end ? req.query.interval_end : Number(new Date())
    if (req.query.interval_end < req.query.interval_start || req.query.interval_start < 0) {
        streamsDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }

    const hexagons = (await Hexagons.find({})).reduce((map, hex) => {
        let streams = {}
        for (var stream in hex.satellite) {
            Object.keys(hex.satellite[stream]).forEach((time_id) => {
                if (Number(start) <= Number(time_id) && Number(end) > Number(time_id)) {
                    if(!(stream in streams)) {
                        streams = {
                            ...streams,
                            [stream]: {
                                max: hex.satellite[stream][time_id].max,
                                min: hex.satellite[stream][time_id].min,
                                average: hex.satellite[stream][time_id].total / hex.satellite[stream][time_id].count,
                                count: hex.satellite[stream][time_id].count
                            }
                        }
                    } else {
                        streams = {
                            ...streams,
                            [stream]: {
                                max: hex.satellite[stream][time_id].max > streams[stream].max ? hex.satellite[stream][time_id].max : streams[stream].max,
                                min: hex.satellite[stream][time_id].min < streams[stream].min ? hex.satellite[stream][time_id].min : streams[stream].min,
                                average: (streams[stream].average * streams[stream].count + hex.satellite[stream][time_id].total) / (streams[stream].count + hex.satellite[stream][time_id].count),
                                count: hex.satellite[stream][time_id].count + streams[stream].count
                            }
                        }
                    }
                }
            })
        }
        map[hex.id] = streams
        return map
    }, {})
    const muns = (await Muns.find({}, 'id streams')).reduce((map, mun) => {
        let streams = {}
        for (var stream in mun.streams) {
            Object.keys(mun.streams[stream]).forEach((time_id) => {
                if (Number(start) <= Number(time_id) && Number(end) > Number(time_id)) {
                    if(!(stream in streams)) {
                        streams = {
                            ...streams,
                            [stream]: {
                                max: mun.streams[stream][time_id].max,
                                min: mun.streams[stream][time_id].min,
                                average: mun.streams[stream][time_id].total / mun.streams[stream][time_id].count,
                                count: mun.streams[stream][time_id].count
                            }
                        }
                    } else {
                        streams = {
                            ...streams,
                            [stream]: {
                                max: mun.streams[stream][time_id].max > streams[stream].max ? mun.streams[stream][time_id].max : streams[stream].max,
                                min: mun.streams[stream][time_id].min < streams[stream].min ? mun.streams[stream][time_id].min : streams[stream].min,
                                average: (mun.streams[stream][time_id].total + streams[stream].total) / (streams[stream].count + mun.streams[stream][time_id].count),
                                count: mun.streams[stream][time_id].count + streams[stream].count
                            }
                        }
                    }
                }
            })
        }
        map[mun.id] = streams
        return map
    }, {})
    
    res.status(200).send({hexagons, muns})
})

// get stream by ID
router.get('/:id', async (req, res) => {
    const doc = await streams.findOne({stream_ID:req.params.id})
    if (!doc) { return res.status(404).send({'Status':'Not Found'}) }
    
    res.status(200).send({
        device_ID: doc.device_ID,
        stream_ID: doc.stream_ID,
        stream_name: doc.stream_name,
        created_at: Number(doc.created_at),
        description: doc.description
    })
})

// delete streams by ID
router.delete('/:id', async (req, res) => {
    const deletion = await streams.deleteOne({stream_ID:req.params.id})
    if (deletion.deletedCount == 0) { return res.status(404).send({'Status':'Not Found'})}
    res.status(204).send()
})

// get all values from stream
router.get('/:stream_id/values', async (req, res) => {
    streamsDebug('[DEBUG] Fetching all stream values')
    const start = req.query.interval_start ? req.query.interval_start : 0
    const compass = Number(Date.now())
    const end = req.query.interval_end ? req.query.interval_end : compass
    if (end < start || start < 0) {
        streamsDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }
    
    let count = await streams.countDocuments({stream_ID:req.params.stream_id})
    if (count == 0){
        streamsDebug(`[ERROR] Stream ${req.params.stream_id} not found`)
        return res.status(404).send({'Error':`Stream ${req.params.stream_id} not found`})
    }
    
    streamsDebug(`[DEBUG] Stream ${req.params.stream_id} exists`)
    sub_vals = []
    var allValues = await values.find({stream_ID: {$eq : req.params.stream_id}})
    await allValues.forEach((doc) => {
        sub_vals.push({
            "value": doc.value,
            "timestamp": doc.created_at,
            "latitude": doc.latitude,
            "longitude": doc.longitude
        })
    })

    streamsDebug('[DEBUG] Fetched with success')
    
    return res.status(200).send(sub_vals)
})

// post value to stream
router.post('/:id/values', validation(validators.validatePostValue, 'body', 'Invalid value'), async (req, res) => {
    streamsDebug('[DEBUG] Creating Value')
    console.log(req.params.id)
    const to_broker = {
        ...req.body,
        stream_ID: req.params.id,
        timestamp: Number(new Date())
    }

    await streams.countDocuments({stream_ID :to_broker.stream_ID}, async (err, count) => {
        if (count == 0) {
            streamsDebug(`[ERROR] Stream ${to_broker.stream_ID} not found`)
            return res.status(404).send({'Error':`Stream ${to_broker.stream_ID} not found`})
        }

        streamsDebug(`[DEBUG] Stream ${to_broker.stream_ID} exists`)

        await producer.publish('cityzoom/values',to_broker)
    
        streamsDebug('[DEBUG] Value created with success')
        return res.status(204).send()
    })
})


module.exports = router
