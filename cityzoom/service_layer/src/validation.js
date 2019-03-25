const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi);

function validateId(object) {
    const schema = {
        id: Joi.objectId()
    }
    return Joi.validate(object, schema)
}

function validatePatch(object) {
    const schema = {
        name: Joi.string().min(5).max(30).optional(),
        password: Joi.string().min(5).max(30).optional()
    }
    return Joi.validate(object, schema)
}

module.exports = {
    validateId,
    validatePatch
}