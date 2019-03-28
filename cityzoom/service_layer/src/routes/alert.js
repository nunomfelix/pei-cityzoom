const express = require('express')
const router = new express.Router()

/* Contains all alert endpoints */

router.get('', (req, res) => {
    res.send('From alert file')
})

module.exports = router