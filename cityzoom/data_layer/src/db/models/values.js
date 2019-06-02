const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const valuesSchema = new mongoose.Schema({
    stream_name: {
        type: String,
        required: true,
        trim: true
    },
    device_ID: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: Number,
        required: true,
        trim: true
    },
    created_at: {
        type: Number,
        required: true,
        trim: true,
        default: Date.now
    },
    hexagon: {},
    municipality: {}
    // latitude: {
    //     type: Number,
    //     required: true,
    //     trim: true
    // },
    // longitude: {
    //     type: Number,
    //     required: true,
    //     trim: true
    // }
})

valuesSchema.index({ stream_name: 1, created_at: 1})
valuesSchema.plugin(uniqueValidator)

const Values = mongoose.model('values', valuesSchema)

module.exports = Values