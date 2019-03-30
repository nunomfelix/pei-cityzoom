
const mongoose = require('mongoose')
const express = require('express')
// my modules
const parser = require('./parser')
const producer = require('./kafka-producer')

const app = express()

app.use(express.json())

app.use('/czb/stream', parser)
app.listen(8001, () => { console.log('listen in port 8001') })