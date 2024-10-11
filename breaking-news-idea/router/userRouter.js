const express = require('express')
const router = express.Router()

const userRouterHandler = require('../router_handler/userRouterHandler.js')

const expressJoi = require('@escook/express-joi')
const { register_login_inspect } = require('../inspect/userInspect.js')

router.post('/registerUser', expressJoi(register_login_inspect), userRouterHandler.registerUser)
router.post('/login', expressJoi(register_login_inspect), userRouterHandler.login)

module.exports = router
