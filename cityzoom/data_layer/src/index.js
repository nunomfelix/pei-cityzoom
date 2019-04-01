const mongoose = require('mongoose')
const express = require('express')
// my modules
const parser = require('./parser')
const producer = require('./kafka-producer')

const app = express()
app.use(express.json())

async function run() {
   await  mongoose.connect('mongodb://localhost', )
    .then(()=> console.log('Connected to MongoDB...'))
    .catch(()=> console.log('Could not connect to MongoDB...'))
    
    app.use('/czb/stream', parser)
    app.listen(8001, () => { console.log('listen in port 8001') })

} 
run()

