const User = require('../db/models/user')
const Vertical = require('../db/models/vertical')
const express = require('express')
const deviceDebug = require('debug')('app:Device')
const axios = require('axios')
const config = require('config')
const { validateCreateDevice } = require('../validation')
const { validationMiddleware, authentication } = require('../middleware')

const router = new express.Router()

/* Contains all device endpoints */

router.post('', [authentication,validationMiddleware(validateCreateDevice, 'body')], async (req,res) => {
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
 
router.get('/:id/values',[authentication], async(req,res)=>{
    //Get device information
    const response = await axios.get(config.get('DATA_LAYER_URL') + '/czb/device/'+req.params.id)

    console.log(response)

    //Knowing which streams are associated to what devices
    const vertical = Vertical.find()

    //Retrieving values from each stream


    res.send("retorna algo de jeito") 
})


module.exports = router