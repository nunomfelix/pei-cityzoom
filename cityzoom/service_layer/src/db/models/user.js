const mongoose = require('mongoose')
const validator = require('validator')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            //True if email ends with valid extension. Ex: @gmail.com,@hotmail.com
            if (!validator.isEmail(value)) {
                throw new Error('Email not valid')
            }
        }
    }, password: {
        type: String,
        required: true,
        minlength: 5 //Password must have at least 5 characters
    },
}, {
        versionKey: false
    })

userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User