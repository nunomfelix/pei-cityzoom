const express = require('express')
const streamDebug = require('debug')('app:Stream')
const { validateGetAllStreams, validateGetDataFromStream, validateGetStreamByID } = require('../validation')
const { validationMiddleware, authentication } = require('../middleware')
const axios = require('axios')
const config = require('config')

const router = new express.Router()

/*  Gets the list of streams whose attributes match the ones in the queries
    Returns the list of all streams, if no query is provided

    queries:/stream?interval_start=<begin_mark>&interval_end=<end_mark>
    req: no req
    returns: list of streams that match queries
    codes:
        [200] Successfully returned streams
        [401] Unauthorized
        [500] Internal server error
*/
router.get('',
    [authentication, validationMiddleware(validateGetAllStreams, 'query')],
    async (req, res) => {
        result = await axios.get(config.get('DATA_LAYER_URL') + '/cbz/stream/list', { params: req.query })
        streamDebug(`Streams loaded with query ${JSON.stringify(req.query)}`)
        res.send(result)
    }
)

/*  Gets a stream by its name

    req: no req
    returns: the stream with the specified name
    codes:
        [200] Successfully returned stream
        [401] Unauthorized
        [404] Stream not found
        [500] Internal server error
*/
router.get('/:stream_name',
    [authentication, validationMiddleware(validateGetStreamByID, 'params')],
    async (req, res) => {
        result = await axios.get(config.get('DATA_LAYER_URL') + '/cbz/stream/' + req.params.stream_name)
        streamDebug(`Stream loaded with name ${JSON.stringify(req.params.stream_name)}`)
        res.send(result)
    }
)

/*  Gets data from a stream

    req: no req
    returns: the values from the specified stream
    codes:
        [200] Successfully returned values
        [401] Unauthorized
        [404] Stream not found
        [500] Internal server error
*/
router.get('/:stream_name/values',
    [authentication, validationMiddleware(validateGetDataFromStream, 'params')],
    async (req, res) => {
        result = await axios.get(config.get('DATA_LAYER_URL') + '/cbz/stream/values', { params: req.params.stream_name })
        streamDebug(`Retrieved values from stream ${JSON.stringify(req.params.stream_name)}`)
        res.send(result)
    }
)

module.exports = router