const joi = require('joi')
const express = require('express')
const  router = express.Router()
/*
 * API Endpoints:
 * create stream         -> localhost:8000/czb/stream (POST)  
 * post data to stream   -> localhost:8000/czb/stream (PUT)
 * read data from stream -> localhost:8000/czb/stream (GET)
 * list all streams      -> localhost:8000/czb/stream/list (GET)
 * delete stream         -> localhost:8000/czb/stream (DELETE)
 * 
 */

router.post('/', (req,res) => {
    console.log(req.body)
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


function validateCreate(stream){
    //token,name,type
    // const schema = { name: Joi.string().min(4).required(),
    //                  token: x
    //                  type: }
    return Joi.validate(stream,schema)
}
module.exports = router