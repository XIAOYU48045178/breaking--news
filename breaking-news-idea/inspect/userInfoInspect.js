const joi = require('joi')
const { updateAvatar } = require('../router_handler/userInfoRouterHandler.js')

const id = joi.number().integer().min(1).required()
const nickname = joi.string().required()
const email = joi.string().email().required()

const UserInfoInspect = {
    body: {
        id,
        nickname,
        email,
    },
}

const password = joi.string().pattern(/^[\S]{6,12}$/).required()

const resettingPasswordInspect = {
    body: {
        oldPassword: password,
        newPassword: joi.not(joi.ref('oldPassword')).concat(password),
    },
}

const avatar = joi.string().dataUri().required()

updateAvatarInspect = {
    body: {
        avatar,
    },
}

module.exports.UserInfoInspect = UserInfoInspect
module.exports.updateAvatarInspect = updateAvatarInspect
module.exports.resettingPasswordInspect = resettingPasswordInspect

