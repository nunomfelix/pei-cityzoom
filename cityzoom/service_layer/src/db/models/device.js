const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, owner: {
        type: String,
        required: true,
        trim: true
    }, location: {
        type: String,
        required: true,
        trim: true
    }, vertical: {
        type: String,
        required: true,
        trim: true
    }, description: {
        type: String
    }
}, {
        versionKey: false
    }
)

deviceSchema.plugin(uniqueValidator)

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device