const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

/*
    {
        “alert_ID”: <alert_ID> (int)
        “alert_name”: <stream_name> (string),
        “created_at”: <creation_time_mark> (string),
        “stream”: <stream_ID> (string),
        “threshold”: <threshold> (string),
        “type”: <alert_type> (string),
        “level”: <alert_level> (string),
        “description”: <description> (string),
        “state”: <alert_state> (boolean)
    }

*/

const alertSchema = new mongoose.Schema({
    alert_ID: {
        type: Number,
        required: true,
        trim: true,
        unique: false
    },
    alert_name: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: String,
        required: true,
        trim: true
    },
    stream: {
        type: String,
        required: true,
        trim: true
    },
    threshold: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: false,
        trim: true
    },
    level: {
        type: String,
        required: false,
        trim: true
    },    
    description: {
        type: String,
        required: false,
        trim: true
    },
    state: {
        type: Boolean,
        required: true,
        default: false,
        trim: true
    }
})

alertSchema.plugin(uniqueValidator)

const Alert = mongoose.model('devices', alertSchema)

module.exports = Alert