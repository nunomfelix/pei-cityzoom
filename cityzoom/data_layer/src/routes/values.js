const express = require('express')
const devices = require('../db/models/devices')
const Value = require('../db/models/values')
const Satellites = require('../db/models/satellite')
const producer = require('../producer')
const {validation} = require('../middleware')
const {validatePostValue} = require('../validation')
const valuesDebug = require('debug')('app:Values')

const router = new express.Router()

//post value to broker
router.post('/:stream_name',validation(validatePostValue,'body','Invalid Stream'), async (req,res)=>{
    valuesDebug('[DEBUG] Receiving Value')
    const to_broker = {
        ...req.body,
        timestamp: req.body.timestamp ? req.body.timestamp : new Date().getTime(),
        stream_name: req.params.stream_name,
    }

    if(to_broker.satellite) {
        await producer.publish('cityzoom/values',to_broker)
        return res.status(200).send(to_broker)
    } else {
        await devices.countDocuments({device_ID :to_broker.device_ID}, async (err, count) => {
            if (count == 0) {
                valuesDebug(`[ERROR] Device ${to_broker.device_ID} not found`)
                return res.status(404).send({'Error':`Device ${to_broker.device_ID} not found`})
            }
            valuesDebug(`[DEBUG] Device ${to_broker.device_ID} exists`)
            await producer.publish('cityzoom/values',to_broker)
            valuesDebug('[DEBUG] Value created with success')
        })
        return res.status(204).send()
    } 

})

// get heatmap data -- ABSOLUTELY NEEDED
router.get('/heatmap', async (req, res) => {
    valuesDebug('[DEBUG] Fetching all stream values')
    var stream_name = req.query.stream_name ? {stream_name: req.query.stream_name} : {} 
    var satellite = req.query.satellite ? true : false
    var start = req.query.interval_start ? Number(req.query.interval_start) : Number(new Date(0))
    var end = req.query.interval_end ? Number(req.query.interval_end) : Number(new Date())
    if (end < start || start < 0) {
        valuesDebug('[ERROR] Interval is wrong')
        return res.status(400).send({error: 'Bad interval defined'})
    }

    var before = new Date()
    const aggregation = [{
        $match: {
            ...stream_name,
            $and: [{created_at: {$gte: start}},{created_at: {$lt: end}}]
        }
    }, {
        $group: {
            _id: {
                id: "$hexagon",
                municipality: "$municipality"
            },
            min: {$min: "$value"},
            max: {$max: "$value"},
            average: {$avg: "$value"},
            count: {$sum: 1},
        }
    }, {
        $project: {
            _id: 0,
            municipality: "$_id.municipality",
            hexas: {
                id: "$_id.id",
                min: "$min",
                max: "$max",
                average: "$average",
                count: "$count",
            }
        },
    }, {
        $group: {
            _id: {
                id: "$municipality",
            },
            hexas: {
                $push: "$hexas"
            },
            min: {$min: "$hexas.min"},
            max: {$max: "$hexas.max"},
            average: {$avg: "$hexas.average"},
            count: {$sum: "$hexas.count"},
        }
    }, {
        $project: {
            _id: 0,
            id: "$_id.id",
            min: 1,
            max: 1,
            average: 1,
            count: 1,
            hexas: 1
        },
    }]


    let tmp = null
    if(satellite)
        tmp = await Satellites.aggregate(aggregation)
    else
        tmp = await Value.aggregate(aggregation)

    var after = new Date()
    console.log("Time took -> ", (after - before) + 'ms')
    
    res.send(tmp)

})

module.exports = router
