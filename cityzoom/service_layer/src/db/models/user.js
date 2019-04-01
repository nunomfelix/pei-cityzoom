const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }, password: {
        type: String,
        required: true,
        minlength: 5 //Password must have at least 5 characters
    }, token: {
        type: String
    }
}, {
        versionKey: false
    }
)

userSchema.plugin(uniqueValidator)

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ username: user.username }, process.env.jwtPrivateKey, { expiresIn: '1 day' })
    user.token = token
    await user.save()
    return token
}

//Hash the plain text password
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User