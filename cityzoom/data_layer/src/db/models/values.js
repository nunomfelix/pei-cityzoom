const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const valuesSchema = new mongoose.Schema({
    stream_ID: {
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
    latitude: {
        type: Number,
        required: true,
        trim: true
    },
    longitude: {
        type: Number,
        required: true,
        trim: true
    }
})

valuesSchema.plugin(uniqueValidator)

const Values = mongoose.model('Values', valuesSchema)

module.exports = Values