const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const satelliteSchema = new mongoose.Schema({
    stream_name: {
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
    municipality: {},
})

satelliteSchema.index({ stream_name: 1, created_at: 1 }, { name: 'heatmap_index' })
satelliteSchema.plugin(uniqueValidator)

const Values = mongoose.model('satellite', satelliteSchema)

module.exports = Values