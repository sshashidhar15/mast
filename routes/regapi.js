let express = require("express")
let router = express.Router()
let config = require('../config')
let request = require('request')

// RegService BRIDGE for GET requests
router.get("/*", (req, res/*, next*/) => {
    let timeout = 1000 * 60 * 2 // 2mins (max for Linux server)
    req.setTimeout(timeout)
    let base = config.reg_service_endpoint.replace(/\/$/, '')
    let uri = base + req.url
    let options = {
        url: uri,
        timeout: timeout
    }
    return request(options, (error, response, body) => {
        let r = null
        try {
            r = JSON.parse(body)
        } catch (e) {
            r = body
        }
        res
            .status(200)
            .json(r)
            .end()
    })
})

// RegService BRIDGE for POST requests
router.post("/*", (req, res/*, next*/) => {
    let timeout = 1000 * 60 * 2 // 2mins (max for Linux server)
    req.setTimeout(timeout)
    let base = config.reg_service_endpoint.replace(/\/$/, '')
    let uri = base + req.url
    let body = req.body
    if (!body.ip || body.ip === 'timeout') {
        body.ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress
    }
    let options = {
        url: uri,
        timeout: timeout,
        form: req.body
    }
    return request.post(options, (error, response, body) => {
        let r = null
        try {
            r = JSON.parse(body)
        } catch (e) {
            r = body
        }
        res
            .status(200)
            .json(r)
            .end()
    })
})

module.exports = router
