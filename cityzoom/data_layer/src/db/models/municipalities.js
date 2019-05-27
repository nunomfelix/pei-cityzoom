const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const munsSchema = new mongoose.Schema({
    municipality: {
        type: String,
        required: true,
        default: "Aveiro"
    },
    average: {
        type: Number,
        required: true,
        default: 0
    },
    values_til_now: {
        type: Number,
        required: true,
        default: 0
    }
})

munsSchema.plugin(uniqueValidator)

const Municipality = mongoose.model('municipalities', munsSchema)

module.exports = Municipality