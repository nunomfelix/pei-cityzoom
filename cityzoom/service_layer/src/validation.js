const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);

function validateId(object) {
    const schema = {
        id: Joi.objectId()
    }
    return Joi.validate(object, schema)
}

function validatePatch(object) {
    const schema = Joi.object().keys({
        name: Joi.string().min(5).max(30),
        password: Joi.string().min(5).max(30)
    }).or('name', 'password')
    return Joi.validate(object, schema)
}

module.exports = {
    validateId,
    validatePatch
}