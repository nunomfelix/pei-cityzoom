const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);

function validateId(object) {
    const schema = {
        id: Joi.objectId()
    }
    return Joi.validate(object, schema)
}

function validatePatch(object) {
    console.log(object)
    const updates = Object.keys(object)
    const allowedUpdates = ['name', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return false
    }
    return true
}

module.exports = {
    validateId,
    validatePatch
}