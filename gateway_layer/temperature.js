const request = require('request');
const express = require('express')
const app = express()

app.use(express.json())

const temp = (lat, long, callback) => {
  const url = 'https://api.darksky.net/forecast/f5e30cf666320006447f251880cad6bc/' + lat + ',' + long +'?units=si' 

  request({ url, json:true}, (error, { body }) => {
    if (error) {
      callback('Unable to connet to forecast services', undefined);
    } else if (body.error) {
      callback('Unable to find location', undefined);
    } else {
      callback(undefined, {
        temperature: body.currently.temperature
      })
    }
  })
}

app.post('/topic/123', (req,res) => {
    temp(23,42, (error, result) => {
        console.log(result)
        res.send(result)
    })
})

// app.listen(3000, () => { console.log('listen in port 3000..') })
