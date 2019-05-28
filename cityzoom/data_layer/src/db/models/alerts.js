const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const deviceSchema = new mongoose.Schema({
    alert_ID: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    alert_name: {
        type: String,
        required: true,
        trim: true
    },
    thresholds: [
        new mongoose.Schema({
            stream_ID: {
                type: String,
                required: true,
                trim: true
            }
        })
    ]
})

deviceSchema.plugin(uniqueValidator)

const Device = mongoose.model('devices', deviceSchema)

module.exports = Device