const express = require('express')
const router = express.Router()

const artcates = require('../router_handler/artcateRouterHandler.js')

router.get('/artcates', artcates.getArticleCates)

const expressJoi = require('@escook/express-joi')

const { artcatesIncreaseInspect } = require('../inspect/artcateInspect.js')
router.post('/artcates/increase', expressJoi(artcatesIncreaseInspect), artcates.articleCatesIncrease)

const { deleteArtcateIdInspect } = require('../inspect/artcateInspect.js')
router.get('/artcates/deletecate/:id', expressJoi(deleteArtcateIdInspect), artcates.deleteArtcateId)

const { getArticleCatesIdInspect } = require('../inspect/artcateInspect.js')
router.get('/artcates/:id',expressJoi(getArticleCatesIdInspect), artcates.getArticleCatesId)

const { updateArticleCateIdInspect } = require('../inspect/artcateInspect.js')
router.post('/artcates/updatecate/:id', expressJoi(updateArticleCateIdInspect), artcates.updateArticleCateId)

module.exports = router