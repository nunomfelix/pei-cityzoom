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
        default: new Date().getTime()
    },
    hexagon: {},
    municipality: {}
})

valuesSchema.index({ stream_name: 1, created_at: 1 }, { name: 'heatmap_index' })
valuesSchema.index({ device_ID: 1, created_at: 1 }, { name: 'device_index' })
valuesSchema.plugin(uniqueValidator)

const Values = mongoose.model('values', valuesSchema)

module.exports = Values