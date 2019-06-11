const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

/*
    {
        "trigger_ID": <trigger_ID> (int)
        "alert_ID": <related_alert> (string)
        "timestamp": <trigger_time> (long),
        "causes": <causers_array> (objectArray)
        "users": <users_array_for_permissions> (stringArray)
    }
*/

const triggerSchema = new mongoose.Schema({
    alert_ID: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Number,
        required: true
    },
    causes: [{}],
    users: [{
        type: String
    }]
})

triggerSchema.plugin(uniqueValidator)

const Trigger = mongoose.model('triggers', triggerSchema)

module.exports = Trigger
