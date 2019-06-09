const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

/*
    {
        "alert_ID": <alert_ID> (string)
        "alert_name": <stream_name> (string),
        "value": <value> (number),
        "type": <type> (string)
        "level": <alert_level> (string),
        "description": <description> (string),
        "notify_mail": <notify_via_mail> (boolean),
        "target": <target_table> (specific string),
        "target_ID": <ID_in_table> (string),
        "target_stream": <trigger_stream> (string),
        "users": <users_array_for_permissions> (stringArray),
        "frequency": <frequency_to_validate> (string)
        "lastOKRead": <last_good_reading> (real)
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
    description: {
        type: String,
        required: false,
        trim: true,
        default: ""
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
    target_ID: [{
        type: String
    }],
    target_stream: {
        type: String,
        required: true,
        trim: true
    },
    users: [{
        type: String 
    }],
    lastOKRead: {
        type: Number,
        required: false,
        default: null
    }
})

alertSchema.plugin(uniqueValidator)

const Alert = mongoose.model('alerts', alertSchema)

module.exports = Alert
