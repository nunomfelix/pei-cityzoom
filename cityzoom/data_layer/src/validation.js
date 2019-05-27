const joi = require('joi')

function validateCreateDevice(object) {
    const schema = joi.object().keys({
        device_ID:  joi.string().required(),
        device_name: joi.string().required(),
        description: joi.string().optional(),
        vertical: joi.array().required(),
        mobile: joi.boolean().required(),
        provider: joi.string().required(),
        municipality: joi.string().optional()
    })
    return joi.validate(object, schema)
}

function validateCreateStream(object) {
    const schema = joi.object().keys({
        stream_ID: joi.string().required(),
        device_ID: joi.string().required(),
        stream_name: joi.string().required(),
        type: joi.string().optional(),
        description: joi.string().optional()
    })
    return joi.validate(object, schema)
}

function validatePostValue(object) {
    const schema = joi.object().keys({
        value: joi.number().required(),
        latitude: joi.number().required(),
        longitude: joi.number().required()
    })
    return joi.validate(object, schema)
}

function validateGetInInterval(object) {
    const schema = joi.object().keys({
        interval_start: joi.number().integer(),
        interval_end: joi.number().integer()
    })
    return joi.validate(object, schema)
}

module.exports = {
    validateCreateDevice,
    validateCreateStream,
    validatePostValue
}
