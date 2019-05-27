const express = require('express')
const mongoose = require('mongoose')
const {validation} = require('../middleware')
const {validatePostValue} = require('../validation')

const router = new express.Router()

const valuesSchema = new mongoose.Schema({
    value:{
        type: Number
    },
    latitude :{
        type: Number
    },
    longitude:{
        type: Number
    }
})


const Value = mongoose.model('Values',valuesSchema)

router.post('',validation(validatePostValue,'body','Invalid Stream'), async (req,res)=>{
    
    let value = new Value({
        value  :   req.body.value,
        latitude:   req.body.latitude,
        longitude:   req.body.longitude
        })
    value = await value.save()

    //console.log(value)
    res.send(value)

})
module.exports = router


