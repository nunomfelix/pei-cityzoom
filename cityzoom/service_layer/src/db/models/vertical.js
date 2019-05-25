const mongoose = require('mongoose')

const verticalSchema = new mongoose.Schema({
        "name": {
            type: String,

        },
        "display": {
            type: String,

        },
        "streams" : {
            type: Object,
        }
    },
    {
        versionKey: false
    }
)


const Vertical = mongoose.model('Vertical',verticalSchema)
module.exports = Vertical