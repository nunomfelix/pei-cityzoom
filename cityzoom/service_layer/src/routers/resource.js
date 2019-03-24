const express = require('express')
const router = new express.Router()

/* Contains all resources endpoints */

router.get('/resource', (req, res) => {
    res.send('From resource file')
})



module.exports = router