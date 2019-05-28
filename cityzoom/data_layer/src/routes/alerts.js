const express = require('express')
const validators = require('../validation')
const { validation } = require('../middleware')
const devicesDebug = require('debug')('app:Alerts')
const devices = require('../db/models/devices')
const streams = require('../db/models/streams')
const values = require('../db/models/values')

//Broker producer and consumer
const producer = require('../producer')

const router = new express.Router()

router.post('')

