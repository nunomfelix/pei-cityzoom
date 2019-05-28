const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const config = require('config')

const hexagonSchema = new mongoose.Schema({
    coordinates: {
        type: Array,
        required: true,
        default: []
    },
    municipality: {
        type: String,
        required: true,
        default: "Aveiro"
    },
    id: {
        type: String,
        required: true,
        default: ""
    },
    streams: {
        
    },
    // average: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    // values_til_now: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // }
})

hexagonSchema.plugin(uniqueValidator)

const Hexagon = mongoose.model('hexagons', hexagonSchema)

module.exports = Hexagon