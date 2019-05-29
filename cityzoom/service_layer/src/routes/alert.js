const config = require('config')
const express = require('express')
const validation = require('../validation')
const { error } = require('../middleware')
const alertDebug = require('debug')('app:Alert')
const axios = require('axios')

const router = new express.Router()

/* Contains all alert endpoints */

router.get('/list',  async (req, res) => {
    const response = await axios.get(config.get('DATA_LAYER_URL') + '/czb/alerts/list/'+req.params)
    res.send(response.data)
})

module.exports = router