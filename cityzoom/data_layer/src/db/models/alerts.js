const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

/*
    {
        "alert_ID": <alert_ID> (int)
        "alert_name": <stream_name> (string),
        "created_at": <creation_time_mark> (string),
        "value": <value> (number),
        "type": <type> (string)
        "level": <alert_level> (string),
        "description": <description> (string),
        "state": <alert_state> (boolean)
    }
*/

const alertSchema = new mongoose.Schema({
    alert_ID: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    alert_name: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    frequency: {
        type: String, 
        required: true,
        trim: true
    },
    level: {
        type: String,
        required: true,
        trim: true
    },
    activations: [{}],
    active: {
        type: Boolean,
        required: false,
        default: false
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    notify_mail: {
        type: Boolean,
        required: true,
        default: false
    },
    target: {
        type: String,
        required: true,
    },
    target_id: [{
        type: String
    }],
    target_stream: {
        type: String,
        required: true,
        trim: true
    }
})

alertSchema.plugin(uniqueValidator)

const Alert = mongoose.model('alerts', alertSchema)

module.exports = Alert
