const express = require('express')
const axios = require('axios')
const mongoose = require('mongoose')
const {validateCreateSubscription}= require('../validation')
const {validation} = require('../middleware')

const router = new express.Router()

const subsSchema = new mongoose.Schema({
    subscription_ID:{
        type: String,
        required: true,
        min: 1
    },
    subscription_name: {
        type: String,
        required: true,
        min: 1
    },
    description: {
        type: String,
        required: false,
        min: 1
    },
    stream_ID: {
        type: String,
        required: true,
        min: 1
    },
    device_ID: {
        type: String,
        required: true,
        min: 1
    }
})

const Subscription = new mongoose.model('Subscription', subsSchema)

router.post('',validation(validateCreateSubscription, 'body', 'Invalid Subscription'), async(req, res) => {
    let subs = new Subscription({ 
        subscription_ID: req.body.subscription_ID,
        subscription_name: req.body.subscription_name,
        description: req.body.description,
        stream_ID: req.body.stream_ID,
        device_ID: req.body.device_ID
    })
    subs = await stream.save()
    res.send(subs)
})

module.exports = router;