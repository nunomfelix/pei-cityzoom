const User = require('../db/models/user')
const express = require('express')
const deviceDebug = require('debug')('app:Device')
const axios = require('axios')
const config = require('config')
const { validateCreateDevice } = require('../validation')
const { validationMiddleware, authentication } = require('../middleware')

const router = new express.Router()

/* Contains all device endpoints */

router.post('', [validationMiddleware(validateCreateDevice, 'body', 'Invalid device'), authentication], async (req,res) => {
    console.log(req.body)
    //console.log(config.get('DATA_LAYER_URL'))    
    const response = await axios.post(config.get('DATA_LAYER_URL') + '/czb/devices', req.body)
    res.send(response.data)
})


router.get('',[authentication],async(req,res)=>{
    const response = await axios.get(config.get('DATA_LAYER_URL') + '/czb/devices')
    res.send(response.data)
})

router.get('/:id',[authentication], async(req,res)=>{
    const response = await axios.get(config.get('DATA_LAYER_URL') + '/czb/device/'+req.params.id)
    res.send(response.data)
})

module.exports = router