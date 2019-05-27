const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const munsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    streams: {
        type: Object,
        required: true,
        default: {}
    },
})

munsSchema.plugin(uniqueValidator)

const Municipality = mongoose.model('municipalities', munsSchema)

module.exports = Municipality