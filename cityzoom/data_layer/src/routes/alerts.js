const express = require('express')
<<<<<<< HEAD
const validators = require('../validation')
const { validation } = require('../middleware')
const devicesDebug = require('debug')('app:Alerts')
const devices = require('../db/models/devices')
const streams = require('../db/models/streams')
const values = require('../db/models/values')

//Broker producer and consumer
const producer = require('../producer')

const router = new express.Router()

router.post('')

=======
const alertDebug = require('debug')('app:Alerts')
const axios = require('axios')
const config = require('config')
const {validatePostAlert} = require('../validation')
const { validation } = require('../middleware')

const router = new express.Router()

/* Contains all alert endpoints */

router.post('', validation(validatePostAlert, 'body', 'Invalid alert'), async (req, res) => {
    const to_broker ={
        alert_name :  req.body['alert_name'],
        threshold  :  req.body['threshold'],
        type       :  req.body['type'],
        stream_ID  :  req.bodu['stream_ID'],
        level      :  req.body['level'],
        notify_mail : req.body['notify_mail']
    }

    res.send({'error':'hey'})
})

//get all alerts
router.get('/list',async (req,res)=>{
    
})
//Read alert details
router.get('/:alert_id',async (req,res)=>{
    
})

//Get details from alerts related to stream
router.get('/:stream_name',async (req,res)=>{
    
})

module.exports = router
>>>>>>> 3a480b806beb7ac2eb2ff2a6b8afbad85dbfa239
