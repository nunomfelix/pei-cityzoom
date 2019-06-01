const express = require('express')
const colors = require('colors')
const mobileDebug = require('debug')('app:Mobileapp')
const axios = require('axios')
const config = require('config')
const {authentication} = require('../../../service_layer/src/middleware')

const router = new express.Router()

/* Contains all mobileapp endpoints */

router.post('/values', async (req,res) => {
    //Gets the user by decoding the authorization header
    let encoded = req.headers.authorization.replace("Basic ","")
    let decoded = new Buffer.from(encoded,'base64').toString('ascii').split(":")
    let username = decoded[0]
    //Creates a device in the DATA LAYER if it doesn't exist
    const createDeviceBody = {
        device_ID: "mobile_app_device_id_"+username, //Uses the user's username has unique identifier of the mobile device
        device_name: "mobile_app_device_name_"+username,
        mobile: true,
        vertical: "mobileapp",
        provider: "Mobile app",
        description: "This is a device from the mobile app"
    }
    try{
        const responseCreateDevice = await axios.post(config.get('DATA_LAYER_URL')+"/czb/devices/",createDeviceBody)
        mobileDebug('Created device',colors.blue(createDeviceBody.device_ID),'!')
    }catch(e){
        mobileDebug('Device',colors.blue(createDeviceBody.device_ID),'already exists')
    }
    await sleep(50)
    
    //If the device was created, creates the corresponding streams
    let streams = ["proximity","battery"] //To be loaded from a file later maybe

    for(i in streams){
        //Creates stream
        const requestCreateStreamBody = {
            device_ID: createDeviceBody.device_ID,
            stream_ID: "mobile_app_stream_id_"+streams[i]+"_"+username,
            stream_name: "mobile_app_stream_name_"+streams[i]+"_"+username
        }
        try{
            const responseCreateStream = await axios.post(config.get('DATA_LAYER_URL')+"/czb/streams",requestCreateStreamBody)
            mobileDebug('Stream',colors.yellow(requestCreateStreamBody.stream_ID),'created with success!')
        }catch(e){
            mobileDebug('Stream',colors.yellow(requestCreateStreamBody.stream_ID),'already exists!')
        }
        await sleep(50)            
        let requestPublishValue = {
            value: req.body[streams[i]],
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            timestamp: req.body.timestamp != undefined ? req.body.timestamp : Date.now()
        }
        try{
            const responsePublishValue = await axios.post(config.get('DATA_LAYER_URL')+"/czb/streams/"+requestCreateStreamBody.stream_ID+"/values",requestPublishValue)
            mobileDebug('Value',colors.red(requestPublishValue.value),'published into stream',colors.yellow(requestCreateStreamBody.stream_ID),'with success!')
        }catch(e){
            mobileDebug('Value',colors.red(requestPublishValue.value),'could not be published into stream',colors.yellow(requestCreateStreamBody.stream_ID),'!')
            return res.status(409).send({'Error':'Could not find stream'+requestCreateStreamBody.stream_ID})
        }
        await sleep(50)
    }
    res.status(204).send()
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router