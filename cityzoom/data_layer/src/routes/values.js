const express = require('express')
const devices = require('../db/models/devices')
const Value = require('../db/models/values')
const Hexas = require('../db/models/hexagons')
const Satellites = require('../db/models/satellite')
const Municipalities = require('../db/models/municipalities')
const producer = require('../producer')
const {validation} = require('../middleware')
const {validatePostValue} = require('../validation')
const valuesDebug = require('debug')('app:Values')

const router = new express.Router()

//post value to brokers
router.post('/:stream_name',validation(validatePostValue,'body','Invalid Stream'), async (req,res)=>{
    valuesDebug('[DEBUG] Receiving Value')
    const to_broker = {
        ...req.body,
        created_at: req.body.timestamp ? req.body.timestamp : new Date().getTime(),
        stream_name: req.params.stream_name,
    } 

    if(to_broker.satellite) {
        await producer.publish('cityzoom/values',to_broker)
        return res.status(200).send(to_broker)
    } else {
        const count = await devices.countDocuments({device_ID :to_broker.device_ID})
        if (count == 0) {
            valuesDebug(`[ERROR] Device ${to_broker.device_ID} not found`)
            return res.status(404).send({'Error':`Device ${to_broker.device_ID} not found`})
        }
        valuesDebug(`[DEBUG] Device ${to_broker.device_ID} exists`)
        await producer.publish('cityzoom/values',to_broker)
        valuesDebug('[DEBUG] Published Value')
        return res.status(200).send(to_broker)
    } 

})

// get heatmap data -- ABSOLUTELY NEEDED
router.get('/heatmap', async (req, res) => {
    valuesDebug('[DEBUG] Fetching all stream values')
    var stream_name = req.query.stream_name ? {stream_name: req.query.stream_name} : {} 
    var satellite = req.query.satellite == "true"
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

router.get('/locations', async (req, res) => {
    valuesDebug('[DEBUG] Fetching values from hexagon in location')
    if (!req.query.latitude || !req.query.longitude) {
        valuesDebug('[DEBUG] Bad query string')
        return res.status(400).send({Status: 'Bad query'})
    } 
    var latitude = Number(req.query.latitude)
    var longitude = Number(req.query.longitude)
  
    const hexa = await Hexas.findOne({
        location: {
            $geoIntersects: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            }
        }
    })

<<<<<<< HEAD
    const hagg = [{
            '$match': {
                'hexagon': hexa ? hexa.id : '01050168'
=======
    const agg = [{
            '$match': {
                'hexagon': hexa.id
>>>>>>> e987f38d1d82e768d44328f7462883d77f427aac
            }
        }, {
            '$group': {
                '_id': {
                    'stream_name': '$stream_name', 
<<<<<<< HEAD
                    'hex': '$hexagon',
=======
                    'hex': '$hexagon'
>>>>>>> e987f38d1d82e768d44328f7462883d77f427aac
                }, 
                'average': { '$avg': '$value' }, 
                'min': { '$min': '$value' }, 
                'max': { '$max': '$value' }, 
                'count': { '$sum': 1 }
            }
        }
    ]
<<<<<<< HEAD
    const magg = [{
            '$match': {
                'municipality': hexa ? hexa.municipality : "010501"
            }
        }, {
            '$group': {
                '_id': {
                    'stream_name': '$stream_name',
                    'mun': '$municipality'
                }, 
                'average': { '$avg': '$value' }, 
                'min': { '$min': '$value' }, 
                'max': { '$max': '$value' }, 
                'count': { '$sum': 1 }
            }
        }
    ]
    const hexAgg = await Satellites.aggregate(hagg)
    const munAgg = await Satellites.aggregate(magg)
    // console.log('mun: '+hexa.municipality+'\nhexagon: '+hexa.id)
    const end = new Date().getTime()
    const start = end-1000*60*60
    console.log(start+'  '+end)
    const hexagonVals = await Satellites.find({hexagon: hexa ? hexa.id : '010517354', created_at: { $gte: start, $lte: end} })
    const municipeVals = await Satellites.find({municipality: hexa ? hexa.municipality : '010517', created_at: { $gte: start, $lte: end} })

    return res.status(200).send({ hexagon: hexagonVals, municipality: municipeVals, hexagon_tuples: hexAgg, municipality_tuples: munAgg})
=======

    const agreg = await Value.aggregate(agg)

    return res.status(200).send(agreg)
>>>>>>> e987f38d1d82e768d44328f7462883d77f427aac
})

module.exports = router
