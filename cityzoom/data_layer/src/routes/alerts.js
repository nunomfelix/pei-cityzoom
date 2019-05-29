const express = require('express')
const alerts = require('../db/models/alerts')
const alertDebug = require('debug')('app:Alerts')
const axios = require('axios')
const config = require('config')
const {validateCreateAlert} = require('../validation')
const { validation } = require('../middleware')
const producer = require('../producer')

const router = new express.Router()

/* Contains all alert endpoints */

/*router.post('', validation(validateCreateAlert, 'body', 'Invalid alert'), async (req, res) => {
    const to_broker ={
        alert_ID   : req.body.alert_ID,
        alert_name :  req.body.alert_name,
        thresholds  :  req.body.thresholds,
        level      :  req.body.level,
        notify_mail : req.body.notify_mail!=undefined ? req.body.notify_mail : false,
        description: req.body.description!=undefined ? req.body.description : "",
        active: false,
        created_at: Date.now()
    }
    console.log(to_broker)
    //Publishes the alert in the broker
    const wasPublished = await producer.publish('cityzoom/alerts',to_broker)
    if(!wasPublished){
        alertsDebug(`[Error] Alert ${to_broker.alert_ID} already exists`)
        return res.status(409).send({'Error':`Alert ${to_broker.alert_ID} already exists`}) 
    }
    res.status(200).send(to_broker)
})*/

//get all alerts
router.get('/list',async (req,res)=>{
    const values = await alerts.find({})
    res.send(values)
})

/*//Read alert details
router.get('/:alert_id',async (req,res)=>{
    const doc = await alerts.findOne({alert_ID:req.params.alert_id})
    if (!doc) { return res.status(404).send({'Status':'Not Found'}) }

    res.status(200).send(doc)
})

//Get details from alerts related to stream
router.get('/:stream_name',async (req,res)=>{
    
})*/

module.exports = router
