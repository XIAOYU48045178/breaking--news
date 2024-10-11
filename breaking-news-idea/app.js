const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
    res.cc = function (err, status = 1) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})

const jwtTokenStr = require('./config/config.js')
const expressJWT = require('express-jwt')
app.use(expressJWT({ secret: jwtTokenStr.jwtSecretKey }).unless({ path: [/^\/nt\//] }))

const userRouter = require('./router/userRouter.js')
app.use('/nt', userRouter)

const userInfoRouter = require('./router/userInfoRouter.js')
app.use('/t', userInfoRouter)

const artCateRouter = require('./router/artcateRouter.js')
app.use('/t/artcate', artCateRouter)

app.use('/uploads', express.static('./uploads'))

const articleRouter = require('./router/articleRouter.js')
app.use('/t/article', articleRouter)

const joi = require('joi')
app.use((err, req, res, next) => {
    if (err instanceof joi.ValidationError) { return res.cc(err) }
    if (err.name === 'UnauthorizedError') { return res.cc('身份认证失败!') }
    res.cc(err)
})

app.listen(3007, () => {
    console.log('api server running at http://127.0.0.1:3007')
})