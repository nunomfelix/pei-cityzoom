const express = require('express')
const router = express.Router()
const fs = require('fs');



fs.readFile('verticals.json', (err, data) => {  
    if (err) throw err;
    let vertical = JSON.parse(data);
    //console.log(JSON.stringify(vertical, null, 4));
})

module.exports = router