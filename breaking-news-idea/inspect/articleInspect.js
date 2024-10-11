const joi = require('@hapi/joi')

const title = joi.string().required()
const artcate_id = joi.number().integer().min(1).required()
const content = joi.string().required().allow('')
const state = joi.string().valid('已发布', '草稿').required()

const articleIncreaseInspect = {
    body: { title, artcate_id, content, state }
}

module.exports = { articleIncreaseInspect }
