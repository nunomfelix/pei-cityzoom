const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

/*
    {
        “alert_ID”: <alert_ID> (int)
        “alert_name”: <stream_name> (string),
        “created_at”: <creation_time_mark> (string),
        "trhesholds": [
            {
                stream_ID: <stream_ID> (string),
                value: <value> (number),
                type: <type> (string)
            }
        ]
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
        unique: true
    },
    alert_name: {
        type: String,
        required: true,
        trim: true
    },
    thresholds: [
        new mongoose.Schema({
            stream_ID: {
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
            }
        })
    ]
})

alertSchema.plugin(uniqueValidator)

const Alert = mongoose.model('alerts', alertSchema)

module.exports = Alert
