const joi = require('joi')

/*
 * API Endpoints:
 * create stream         -> localhost:8000/czb/stream (POST)  
 * post data to stream   -> localhost:8000/czb/stream (PUT)
 * read data from stream -> localhost:8000/czb/stream (GET)
 * list all streams      -> localhost:8000/czb/stream/list (GET)
 * delete stream         -> localhost:8000/czb/stream (DELETE)
 * 
 */


const parseRequest = () => {

}

module.exports = {
    parseRequest
}