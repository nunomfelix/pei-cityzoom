const express = require('express')
const mongoose = require('mongoose')
const {validation} = require('../middleware')
const {validatePostValue} = require('../validation')
const Value = require('../db/models/values')

const router = new express.Router()

router.post('',validation(validatePostValue,'body','Invalid Stream'), async (req,res)=>{
    let value = new Value({
        value  :   req.body.value,
        latitude:   req.body.latitude,
        longitude:   req.body.longitude,
        created_at: req.body.timestamp
    })
    value = await value.save()

    res.send(value)
})

module.exports = router
