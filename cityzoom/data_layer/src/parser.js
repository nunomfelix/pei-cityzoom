/*
 * API Endpoints:
 * create stream         -> localhost:8000/czb/stream (POST)  
 * post data to stream   -> localhost:8000/czb/stream (PUT)
 * read data from stream -> localhost:8000/czb/stream (GET)
 * list all streams      -> localhost:8000/czb/stream/list (GET)
 * delete stream         -> localhost:8000/czb/stream (DELETE)
 * 
 */
const { run, genDataCreationPayload } = require('./kafka-producer')
const create = require('./kafka-admin')
const prod = require('./kafka-producer')
const consumer = require('./kafka-consumer')
const Joi = require('joi')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

const streamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 30
    },
    description: {
        type: String,
        minlength: 5,
        maxlength: 200
    },
    mobile: {
        isMobile: Boolean,
    },
    type: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 30
    },
    ttl: {
        type: Number,
        min: 10,
        max: 200
    },
    periodicity: {
        type: Number,
        min: 10,
        max: 200
    },
    timestamp: {
        type: Number
    }
})

const Stream = mongoose.model('Stream', streamSchema)

router.post('/', async (req, res) => {
    const { error } = validateCreate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    //temp
    var account = 'user_1'
    //kafka

    var created = await create.createStream(req.body.name)

    console.log(req.body)

    let stream = new Stream(req.body)

    stream = await stream.save()
        .then((result) => {
            console.log('saved: ', result)
        }).catch((err) => {
            console.log('error: ', err)
        });

    if (req.body.periodicity != 0) {
        req.body.periodicity
    }
    else {
        req.body.periodicity = 1200
    }

    res.status(201).send({
        status: 'Created data stream',
        name: req.body.name,
        account,
        periodicity: req.body.periodicity
    })

})
//query string

router.get('/values', async (req, res) => {

    const { error } = validateQueryString(req.query);
    if (error) return res.status(400).send(error.details[0].message);

    const query = await Stream
        .findOne(req.query)

    console.log(req.query)
    const c = consumer.readData(query.stream)
    console.log(c)
    res.send(
        console.log(query)
    )
})

router.get('/', (req, res) => {
    //console.log(req.query)
    res.send({
        status: 'read data in stream OK'
    })
})

router.put('/', async (req, res) => {
    const { error } = validatePutData(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const stream_name = await Stream.findOneAndUpdate(req.body.stream_name)

    if (!stream_name) return res.status(404).send('The stream with the given name was not found');

    console.log(req.body)
    var payload = prod.genDataCreationPayload('user_1', req.body.stream_name, req.body.value, Number(new Date()), req.body.location)
    console.log(payload)
    prod.putData(payload)

    //console.log(req)
    res.status(200)
})


router.delete('/', async (req, res) => {
    const stream_name = await Stream.findOneAndDelete(req.body.name)
    if (!stream_name) return res.status(404).send('The stream with the given name was not found');

    console.log(req)
    res.send({
        status: 'delete stream OK'
    })
})

function validateQueryString(stream) {
    const schema = {
        stream: Joi.string().min(4).required(),
        interval_start: Joi.number(),
        interval_end: Joi.number()
    }
    return Joi.validate(stream, schema)
}

function validateDataStream(stream) {
    const schema = { stream_name: Joi.string().min(4).required() }
    return Joi.validate(stream, schema)
}
function validatePutData(stream) {
    const schema = {
        stream_name: Joi.string().min(4).required(),
        values: Joi.string().min(4).required(),
        location: Joi.array().items(Joi.number().required(), Joi.number().required())
    }
    return Joi.validate(stream, schema)
}

function validateCreate(stream) {
    const schema = {
        name: Joi.string().min(4).required(),
        type: Joi.string().min(4).required(),
        description: Joi.string(),
        mobile: Joi.boolean(),
        periodicity: Joi.number().integer().positive(),
        ttl: Joi.number().integer().positive()
    }
    return Joi.validate(stream, schema)
}
module.exports = router