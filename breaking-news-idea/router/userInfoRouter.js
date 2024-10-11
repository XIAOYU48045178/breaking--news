const express = require('express')
const router = express.Router()

const userInfo = require('../router_handler/userInfoRouterHandler.js')
router.get('/userinfo', userInfo.getUserInfo)

const expressJoi = require('@escook/express-joi')
const { UserInfoInspect } = require('../inspect/userInfoInspect.js')
router.post('/userinfo', expressJoi(UserInfoInspect), userInfo.updateUserInfo)

const { resettingPasswordInspect } = require('../inspect/userInfoInspect.js')
router.post('/userinfo/resetting', expressJoi(resettingPasswordInspect), userInfo.resettingPassword)

const { updateAvatarInspect } = require('../inspect/userInfoInspect.js')
router.post('/userinfo/avatar', expressJoi(updateAvatarInspect), userInfo.updateAvatar)

module.exports = router
