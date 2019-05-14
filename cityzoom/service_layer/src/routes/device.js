const Device = require('../db/models/device')
const User = require('../db/models/user')
const express = require('express')
const deviceDebug = require('debug')('app:Device')
const axios = require('axios')
const config = require('config')
const { validateCreateDevice } = require('../validation')
const { validationMiddleware, authentication } = require('../middleware')

const router = new express.Router()

/* Contains all device endpoints */

router.post('', [validationMiddleware(validateCreateDevice, 'body'), authentication], async (req, res) => {

    const user = await User.findOne({ username: req.body.owner });
    if (!user)
        return res.status(400).send('User ' + req.body.owner + " does not exist")
    //TODO: Verify verticals
    //const vertical = Vertical.findOne({name: req.body.vertical})
    //if(!vertical)
    //  return res.status(400).send('Vertical '+req.body.vertical+' does not exist')
    const dev = new Device(req.body)
    await dev.save()
    deviceDebug(`Device ${dev.name} successfully created`)
    return res.status(201).send(dev)
})

router.get('', [authentication], async (req, res) => {
    const result = await Device.find(req.query)
    deviceDebug(`Device loaded with query ${JSON.stringify(req.query)}`)
    res.send(result)
})

module.exports = router