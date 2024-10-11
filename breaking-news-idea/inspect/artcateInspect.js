const joi = require('@hapi/joi')

const name = joi.string().required()
const alias = joi.string().alphanum().required()
const id = joi.number().integer().min(1).required()

const artcatesIncreaseInspect = {
    body: { name, alias }
}

deleteArtcateIdInspect = {
    params: { id }
}

const getArticleCatesIdInspect = {
    params: { id }
}

const updateArticleCateIdInspect = {
    body: { Id: id, name, alias }
}

module.exports = { artcatesIncreaseInspect, deleteArtcateIdInspect, getArticleCatesIdInspect, updateArticleCateIdInspect }
