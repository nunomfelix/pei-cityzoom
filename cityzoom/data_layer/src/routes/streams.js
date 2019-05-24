const express = require('express')
const mongoose = require('mongoose')
const {validation} = require('../middleware')
const {validateCreateStream} = require('../validation')

const router = new express.Router()

const streamSchema = new mongoose.Schema({
    stream_id:{
        type: String,
        required: true,
        minlength: 5  
    },
    stream_name :{
        type: String,
        required: true,
        minlength: 5
    },
    description:{
        type: String,
        minlength:5
    },
    device_id:{
        type: String,
        required: true,
        minlength:5
    },
    type:{
        type: String,
        required: true,
        minlength:5
    }
})


const Stream = mongoose.model('Stream',streamSchema)

router.post('',validation(validateCreateStream,'body','Invalid Stream'), async (req,res)=>{
    console.log(req.body)
    
    
    let stream = new Stream({
        stream_id  :   req.body.stream_id,
        stream_name:   req.body.stream_name,
        description:   req.body.description,
        device_id  :   req.body.device_id,
        type       :   req.body.type
    })
    stream = await stream.save()

    //console.log(stream)
    res.send(stream)

})
module.exports = router


