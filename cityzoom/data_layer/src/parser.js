/*
 * API Endpoints:
 * create stream         -> localhost:8000/czb/stream (POST)  
 * post data to stream   -> localhost:8000/czb/stream (PUT)
 * read data from stream -> localhost:8000/czb/stream (GET)
 * list all streams      -> localhost:8000/czb/stream/list (GET)
 * delete stream         -> localhost:8000/czb/stream (DELETE)
 * 
 */
const Joi = require('joi')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const streamSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    description:{
        type: String,
        minlength: 5,
        maxlength: 200
    },
    mobile:{
        isMobile: Boolean,
    },
    type:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    ttl:{
        type: Number,
         min: 10,
         max: 200
    },
    periodicity:{
        type: Number,
         min: 10,
         max: 200
    }
})

const Stream = mongoose.model('Stream',streamSchema)

router.post('/', async (req,res) => {
    const { error} = validateCreate(req.body);
    if(error) return res.status(400).send(error.details[0].message);
   
    console.log(req.body)
   
    let stream = new Stream({
        name: req.body.name
    })
   
    stream = await stream.save()
   
    res.send({
        status: 'create stream OK'
    })
})

router.get('/', (req,res) => {
    console.log(req)
    res.send({
        status: 'read data in stream OK'
    })
})

router.get('/:stream', (req,res) => {
    console.log(req)
    res.send({
        status: 'read data in stream OK'
    })
})

router.put('/', (req,res) => {
    console.log(req)
    res.send({
        status: 'put data in stream OK'
    })
})

router.delete('/', (req, res) => {
    console.log(req)
    res.send({
        status: 'delete stream OK'
    })
})
// function validateDeleteStream(stream){
//     const schema = { stream_name : Joi.string().min(4).required() }
//     return Joi.validate(stream,schema) 
// }

// function validateReadDetails(stream){
//    const schema = { stream_name : Joi.string().min(4).required() }
//    return Joi.validate(stream,schema) 
// }
function validateDataStream(stream){
   const schema = { stream_name : Joi.string().min(4).required() }
   return Joi.validate(stream,schema) 
}
function validatePutData(stream){
    const schema = { stream_name : Joi.string().min(4).required(),
                     values     : Joi.string().min(4).required(),
                     location   : Joi.array().items( Joi.number().required() , Joi.number().required())
    }
    return Joi.validate(stream,schema)
}

function validateCreate(stream){
    const schema = { 
        name:        Joi.string().min(4).required(),
        type:        Joi.string().min(4).required(),
        description: Joi.string(),
        mobile:      Joi.boolean(),
        periodicity: Joi.number().integer().positive(),
        ttl:         Joi.number().integer().positive()
    }
    return Joi.validate(stream,schema)
}
module.exports = router