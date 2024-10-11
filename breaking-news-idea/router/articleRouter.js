const express = require('express')
const router = express.Router()

const multer = require('multer')
const path = require('path')
const upload = multer({ dest: path.join(__dirname, '../uploads') })

const article = require('../router_handler/articleRouterHandler.js')
const expressJoi = require('@escook/express-joi')
const { required } = require('joi')
const articleIncreaseInspect = require('../inspect/articleInspect.js')
router.post('/artcles/increase', upload.single('book_corver'), expressJoi(articleIncreaseInspect), article.articleIncrease)

module.exports = router
