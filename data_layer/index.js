// npm modules
const express = require('express')

// my modules
const parser = require('./parser')
const producer = require('./kafka-producer')

const app = express()

app.use(express.json())

app.post('/czb/stream', (req,res) => {
    console.log(req.body)
    res.send({
        status: 'create stream OK'
    })

})

app.get('/czb/stream', (req,res) => {
    console.log(req)
    res.send({
        status: 'read data in stream OK'
    })
})

app.put('/czb/stream', (req,res) => {
    console.log(req)
    res.send({
        status: 'put data in stream OK'
    })
})

app.delete('/czb/stream', (req, res) => {
    console.log(req)
    res.send({
        status: 'delete stream OK'
    })
})


app.listen(8001, () => { 
    console.log('listen in port 8001') 
})