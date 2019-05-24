const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const subscriptionsSchema = new mongoose.Schema({
    device_ID: {
        type: String,
        required: true,
        trim: true
    },
    stream_ID: {
        type: String,
        required: true,
        trim: true
    },
    subscription_ID: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    subscription_name: {
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

subscriptionsSchema.plugin(uniqueValidator)

const Subscriptions = mongoose.model('subscriptions', subscriptionsSchema)

module.exports = Subscriptions