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
    verticals: [{
        type: String,
        required: true,
        trim: true
    }],
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
    location: {
        type: Array,
        required: true,
        default: []
    },
    description: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    streams: []
})

deviceSchema.plugin(uniqueValidator)

const Device = mongoose.model('devices', deviceSchema)

module.exports = Device