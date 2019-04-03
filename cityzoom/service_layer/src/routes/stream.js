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
        var result = {}
        try {
            result = await axios.get(config.get('DATA_LAYER_URL') + '/czb/stream/list', { params: req.query })
        } catch (e) {
            streamDebug(e)
            res.status(500).send('Internal Server Error')
        }
        streamDebug(`Streams loaded with query ${JSON.stringify(req.query)}`)
        res.send(result.data)
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
        try {
            result = await axios.get(config.get('DATA_LAYER_URL') + '/czb/stream/' + req.params.stream_name)
            console.log('res: ', result.status)
            streamDebug(`Stream loaded with name ${JSON.stringify(req.params.stream_name)}`)
            res.send(result.data)
        } catch (e) {
            streamDebug(e)
            res.status(500).send('Internal Server Error')
        }
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
        const result = null
        try {
            console.log(req.query)
            result = await axios.get(config.get('DATA_LAYER_URL') + '/czb/stream/values', { params: req.query })
            console.log('res:', result.status)
            streamDebug(`Retrieved values from stream ${JSON.stringify(req.params.stream_name)}`)
            res.send(result.data)    
        } catch (e) {
            streamDebug(e)
            res.status(500).send('Internal Server Error')
        }
    }
)

module.exports = router