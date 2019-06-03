const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const munsSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    streams: {
        type: Object,
        required: true,
        default: {}
    },
    hexagons: {
        type: Array
    },
    satellite: {}
})

munsSchema.index({"hexagons.location": "2dsphere"}); // schema level
munsSchema.plugin(uniqueValidator)

const Municipality = mongoose.model('municipalities', munsSchema)

module.exports = Municipality