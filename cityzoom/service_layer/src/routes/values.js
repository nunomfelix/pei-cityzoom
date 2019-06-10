
const express = require('express')
const {validation} = require('../middleware')
const {validatePostValue} = require('../validation')
const valuesDebug = require('debug')('app:Values')
const config = require('config')
const axios = require('axios')

const router = new express.Router()

//post value to broker
router.post('/:stream_name', async (req,res)=>{
    valuesDebug('[DEBUG] Receiving Value')
    const response =  await axios.post(config.get('DATA_LAYER_URL')+'/czb/values/'+req.params.stream_name)
    res.send(response.data)
})

// get heatmap data -- ABSOLUTELY NEEDED
router.get('/heatmap', async (req, res) => {
    const response = await axios.get(config.get('DATA_LAYER_URL')+'/czb/values/heatmap')
    res.send(response.data) 
})

router.get('/locations', async (req, res) => {
    const response = await axios.get(config.get('DATA_LAYER_URL')+'/czb/values/locations')
    res.send(response.data) 
})

module.exports = router
