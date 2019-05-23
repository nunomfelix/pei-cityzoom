const express = require('express')
const validation = require('../validation')
const middleware = require('../middleware')
const devices = require('../db/models/devices')

const router = new express.Router()

// create a device -- Need to Test
router.post('', 
    [middleware.validation(validation.validateCreateDevice, 'body', 'Invalid device')], 
    async (req, res) => {
        // convert request to broker-stuff
        to_broker = {
            device_ID: req.body['device_ID'],
            device_name: req.body['device_name'],
            vertical: req.body['vertical'],
            mobile: req.body['mobile'],
            provider: req.body['provider'],
            created_at: Date.now 
        }
        var query = devices.where({ device_ID: to_broker.device_ID})
        query.findOne((err, res) => {
            if (res) {
                return res.status(400).send(to_broker.device_ID + " already exists")
            }
        })

        /*
         * TODO
         * Implement the broker send request
         * While not implemented it will have a straight connection to mongoDB
         */

        // straight connection
        await devices.create(to_broker)

        res.status(200).send({ 
            status: 'Creation successful',
            device_ID: req.body['device_ID'],
            device_name: req.body['device_name'],
            vertical: req.body['vertical'],
            mobile: req.body['mobile'],
            provider: req.body['provider'],
            created_at: Date.now 
          })
    }
)

// get all devices -- Need to test
router.get('', 
    [middleware.validation(validation.validateGetInInterval, 'params', 'Invalid interval')],
    async (req, res) => {
        var result = {}
        const start = req.params['interval_start'] ? req.params['interval_start'] : 0
        const compass = Date.now
        const end = req.params['interval_end'] ? req.params['interval_end']: compass
        if (end < start) {
            return res.status(400).send('Bad interval defined')
        }
        var allDevices = devices.find({created_at: { $gte: start, $lte: end}})
        if (start != 0) { result['start'] = start }
        if (end != compass) { result['end'] = end }
        result['total_devices'] = allDevices.countDocuments()
        result['user_devices'] = allDevices
        
        res.status(200).send(result)
})

// get device by ID -- Need to test
router.get('/:id', async (req, res) => {
    const read = await devices.findOne({device_ID:req.params.id})
    if (!read) { return res.status(404).send({'Status':'Not Found'}) }
    res.status(200).send(read)
})

// delete device by ID -- Need to test
router.delete('/:id', async (req, res) => {
    const deletion = await devices.deleteOne({device_ID:req.params.id})
    if (deletion.deletedCount == 0) { return res.status(404).send({'Status':'Not Found'})}
    res.status(204)
})