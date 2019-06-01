const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const hexagonSchema = new mongoose.Schema({
    municipality: {
        type: String,
        required: true,
        default: "Aveiro"
    },
    id: {
        type: String,
        required: true,
        default: "",
        unique: true
    },
    location: {},
    streams: {},
    satellite: {}
})

hexagonSchema.index({location: "2dsphere"}); // schema level
hexagonSchema.plugin(uniqueValidator)

const Hexagon = mongoose.model('hexagons', hexagonSchema)

module.exports = Hexagon