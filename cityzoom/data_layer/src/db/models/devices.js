const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const deviceSchema = new mongoose.Schema({
    device_ID: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    device_name: {
        type: String,
        required: true,
        trim: true
    },
    vertical: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: Boolean,
        required: true,
        default: true,
        trim: true
    },
    provider: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Number,
        required: true,
        trim: true,
        default: Date.now
    },
    locations: {
        type: Array,
        required: true,
        default: []
    },
    description: {
        type: String,
        required: false,
        trim: true,
        default: ""
    }
})

deviceSchema.plugin(uniqueValidator)

const Device = mongoose.model('Devices', deviceSchema)

module.exports = Device