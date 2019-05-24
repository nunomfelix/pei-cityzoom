const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const streamsSchema = new mongoose.Schema({
    device_ID: {
        type: String,
        required: true,
        trim: true
    },
    stream_ID: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    stream_name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
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
    description: {
        type: String,
        required: false,
        trim: true,
        default: ""
    }
})

streamsSchema.plugin(uniqueValidator)

const Streams = mongoose.model('streams', streamsSchema)

module.exports = Streams