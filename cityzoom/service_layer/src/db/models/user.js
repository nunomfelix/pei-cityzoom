const mongoose = require('mongoose')
const validator = require('validator')
const uniqueValidator = require('mongoose-unique-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { TOKEN_GENERATION_SECRET } = require('../../index')

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
    }, tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
}, {
        versionKey: false
    }
)

userSchema.plugin(uniqueValidator)

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ username: user.username }, TOKEN_GENERATION_SECRET, { expiresIn: '1 day' })
    user.tokens = user.tokens.concat({ token })
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