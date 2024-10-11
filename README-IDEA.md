`初始化`
--

`> 创建项目`

`! 新建 breaking-news-idea 文件夹作为项目根目录`

`1. 初始化包管理配置文件` `npm init -y`

`2. 安装特定版本的 express` `npm i express@4.17.1`

`3. 在项目根目录初始化的代码` `app.js`

```js
const express = require('express')
const app = express()

app.listen(3007, function () {
  console.log('nt server running at http:--27.0.0.1:3007')
})
```

`> 配置 cors 跨域`

`1. 安装 cors 中间件` `npm i cors@2.8.5`

`2. 导入并配置 cors 中间件` `app.js`

```js
const cors = require('cors')
app.use(cors())
```

`> 配置解析表单数据的中间件`

`1. 配置解析表单数据的中间件` `application/x-www-form-urlencoded`

```js
app.use(express.urlencoded({ extended: false }))
```

`> 初始化路由相关的文件夹`

`1. 在项目根目录中新建 router 文件夹用来存放所有的路由模块`  

`路由模块中只存放客户端的请求与处理函数之间的映射关系`

`2. 在项目根目录中，新建 router_handler 文件夹 用来存放所有的路由处理函数模块`
    
`路由处理函数模块中专门负责存放每个路由对应的处理函数`

`> 初始化用户路由模块`

`1. 初始化代码` `router` `userRouter.js`

```js
const express = require('express')
const router = express.Router()
router.post('/registerUser', (req, res) => { res.send('OK') })
router.post('/login', (req, res) => { res.send('OK') })
module.exports = router
```

`2. 导入并使用用户路由模块`  `app.js`

```js
const userRouter = require('./router/userRouter')
app.use('/nt', userRouter)
```

`> 抽离用户路由模块中的处理函数`

`目的为了保证路由模块的纯粹性所有的路由处理函数必须抽离到对应的路由处理函数模块中`

`1. 向外共享两个路由处理函数`  `/router_handler/userRouterHandler.js`

```js
const registerUser = (req, res) => { res.send('OK') }
const login = (req, res) => { res.send('OK') }
module.exports = { registerUser, login }
```

`2. 代码修改` `/router/userRouter.js`

```js
const express = require('express')
const router = express.Router()

const userRouterHandler = require('../router_handler/userRouterHandler.js')

router.post('/registerUser', userRouterHandler.registerUser)
router.post('/login', userRouterHandler.login)

module.exports = router
```

`登录注册`
--

`> 新建 users 表`

`1. 在 db_01 数据库中新建 users 表`

```sql
CREATE TABLE `db_01`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nicname` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `pic` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE);
```

`> 安装并配置 mYSQL 这个第三方模块来连接和操作 mYSQL 数据库`

`1. 安装 mysql 模块` `npm i mysql@2.18.1`


`2. 创建数据库的连接对象` `/database/connect.js`

```js
const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'db_01',
})

module.exports = db
```

`3. 注册`

`! 实现步骤` `1. 检测表单数据是否合法` `2. 检测用户名是否被占用` `3. 对密码进行加密处理` `4. 插入新用户`

`3.1 检测表单数据是否合法`

`3.1.1 判断用户名和密码是否为空`

```js
const userinfo = req.body
if (userinfo.username || userinfo.password) {
  return res.send({ status: 1, message: '用户名或密码不能为空' })
}
```

`3.2 检测用户名是否被占用`

`3.2.1 导入数据库操作模块`

```js
const db = require('../database/connect.js')
```

`3.2.2 定义 SQL 语句`

```js
const sql = `select * from users where username=?`
```

`3.2.3 执行 SQL 语句并根据结果判断用户名是否被占用`

```js
db.query(sql, [userinfo.username], function (err, results) {
  if (err) {
    return res.send({ status: 1, message: err.message })
  }
  if (results.length > 0) {
    return res.send({ status: 1, message: '用户名被占用请更换其他用户名' })
  }
})
```

`3.3 对密码进行加密处理` `bcryptjs`

`为了保证密码的安全性不建议在数据库以明文的形式保存用户密码推荐对密码进行加密存储` 

`优点` `加密之后的密码无法被逆向破解 同一明文密码多次加密得到的加密结果各不相同保证了安全性`

`3.3.1 安装指定版本的 bcryptjs` `npm i bcryptjs@2.4.3`

`3.3.2 导入 bcryptjs`  `/router_handler/userRouterHandler.js`

```js
const bcrypt = require('bcryptjs')
```

`3.3.3 在注册用户的处理函数中确认用户名可用之后调用 bcrypt.hashSync(明文密码, 随机盐的长度) 方法对用户的密码进行加密处理`

```js
userinfo.password = bcrypt.hashSync(userinfo.password, 10)
```

`3.4 插入新用户`

`3.4.1 定义插入用户的 SQL 语句`

```js
const sql = 'insert into users set ?'
```

`3.4.2 执行 SQL 语句 插入新用户`

```js
db.query(sql, { username: userinfo.username, password: userinfo.password }, function (err, results) {
  if (err) return res.send({ status: 1, message: err.message })
  if (results.affectedRows !== 1) {
    return res.send({ status: 1, message: '注册用户失败请稍后再试' })
  }
  res.send({ status: 0, message: '注册成功' })
})
```

`4. 优化 res.send 代码`

`在处理函数中需要多次调用 res.send 向客户端响应处理失败的结果 为了简化代码 可以手动封装一个 res.cc 函数`

`4.1 在所有路由之前声明一个全局中间件 为 res 对象挂载一个 res.cc 函数`  `app.js`

```js
app.use((req, res, next) => {
    --status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function (err, status = 1) {
        res.send({
            status,
            --状态描述判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})
```

`4.2 修改代码`

```js
db.query(insertSql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
    if (err) { return res.cc(err) }
    if (results.affectedRows !== 1) {
        return res.cc('注册失败请稍后重试')
    }
    res.cc('注册成功', 0)
})
```

`5 优化表单数据验证`

`表单验证的原则前端验证为辅后端验证为主后端永远不要相信前端提交过来的任何内容`

`在实际开发中 前后端都需要对表单的数据进行合法性的验证 而且后端做为数据合法性验证的最后一个关口 在拦截非法数据方面起到了至关重要的作用 单纯的使用 if...else... 的形式对数据合法性进行验证效率低下出错率高维护性差 因此推荐使用第三方数据验证模块来降低出错率提高验证的效率与可维护性让后端程序员把更多的精力放在核心业务逻辑的处理上`

`5.1 安装 @hnt/joi 包为表单中携带的每个数据项定义验证规则` `npm install @hnt/joi@17.1.0`

`5.2 安装 @escook/express-joi 中间件来实现自动对表单数据进行验证的功能` `npm i @escook/express-joi`

`5.3 新建信息验证规则模块并初始化代码` `/inspect/userInspect.js`

```js
const joi = require('@hnt/joi')

--值必须是字符串
string() 
--值只能是包含 a-z A-Z 0-9 的字符串
alphanum() 
--最小长度
min(length) 
--最大长度
max(length) 
--值是必填项不能为 undefined
required() 
--值必须符合正则表达式的规则
pattern(正则表达式) 

const username = joi.string().alphanum().min(1).max(10).required()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()

const register_login_inspect = {
    body: {
        username,
        password,
    },
}

module.exports = {register_login_inspect}
```

`5.4 修改代码` `/router/userRouter.js`

```js
const express = require('express')
const router = express.Router()

const userRouterHandler = require('../router_handler/userRouterHandler.js')

const expressJoi = require('@escook/express-joi')
const { register_login_inspect } = require('../inspect/userInspect.js')

--在注册新用户的路由中声明局部中间件对当前请求中携带的数据进行验证 
--数据验证通过后会把这次请求流转给后面的路由处理函数
--数据验证失败后终止后续代码的执行并抛出一个全局的 Error 错误进入全局错误级别中间件中进行处理
router.post('/registerUser', expressJoi(register_login_inspect), userRouterHandler.registerUser)
router.post('/login', expressJoi(register_login_inspect), userRouterHandler.login)

module.exports = router
```

`5.5 在全局错误级别中间件中捕获验证失败的错误并把验证失败的结果响应给客户端` `app.js`

```js
const joi = require('@hnt/joi')

app.use(function (err, req, res, next) {
  --数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  --未知错误
  res.cc(err)
})
```

`6. 登录`

`! 实现步骤` `1. 检测表单数据是否合法` `2. 根据用户名查询用户的数据` `3. 判断用户输入的密码是否正确` `4. 生成 JWT 的 Token 字符串`

`6.1 检测登录表单的数据是否合法`

`6.1.1 代码修改 `/router/userRouter.js`

```js
router.post('/login', expressJoi(register_login_inspect), userRouterHandler.login)
```

`6.2 根据用户名查询用户的数据`

`6.2.1 接收表单数据`

```js
const userinfo = req.body
```

`6.2.2 定义 SQL 语句`

```js
const sql = `select * from users where username=?`
```

`6.2.3 执行 SQL 语句查询用户的数据`

```js
db.query(sql, userinfo.username, function (err, results) {
  --执行 SQL 语句失败
  if (err) return res.cc(err)
  --执行 SQL 语句成功，但是查询到数据条数不等于 1
  if (results.length `>== 1) return res.cc('登录失败')
  --TODO判断用户输`入的登录密码是否和数据库中的密码一致
})
```

`6.3 判断用户输入的密码是否正确`

`核心实现思路调用 bcrypt.compareSync(用户提交的密码, 数据库中的密码) 方法比较密码是否一致 返回值是布尔值 true 一致 false 不一致`

```js
const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
if (!compareResult) { return res.cc('登录失败') }
```

`6.4 生成 JWT 的 Token 字符串`

`核心注意点在生成 Token 字符串的时候一定要剔除密码和头像的值`

`6.4.1 通过 ES6 的高级语法 快速剔除 密码 和 头像 的值`

```js
--剔除完毕之后 user 中只保留了用户的 id username nickname email 这四个属性的值
const user = { ...results[0], password: '', user_pic: '' }
```

`6.4.2 安装生成 Token 字符串的包` `npm i jsonwebtoken@8.5.1`

`6.4.3 导入 jsonwebtoken` `/router_handler/userRouterHandler.js`

```js
const jwt = require('jsonwebtoken')
```

`6.4.4 向外共享 加密 和 还原 Token 的 jwtSecretKey 字符串` `/config/config.js`

```js
jwtTokenStr = { jwtSecretKey: 'XIAOYU' }
module.exports = jwtTokenStr
```

`6.4.5 将用户信息对象加密成 Token 字符串`

```js
const config = require('../config/config.js')

--生成 Token 字符串 有效期为 10 个小时
const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: '10h' })
```

`6.4.6 将生成的 Token 字符串响应给客户端`

```js
res.send({
  status: 0,
  message: '登录成功',
  --为了方便客户端使用 Token 在服务器端直接拼接上 Bearer 的前缀
  token: 'Bearer ' + tokenStr,
})
```

`7. 配置解析 Token 的中间件`

`7.1 安装解析 Token 的中间件` `npm i express-jwt@5.3.3`

`7.2 注册路由之前配置解析 Token 的中间件` `app.js`

```js
const config = require('./config/config.js')

--解析 token 的中间件
const expressJWT = require('express-jwt')

--使用 unless 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/nt\-- }))
```

`7.3 在错误级别中间件里面捕获并处理 Token 认证失败后的错误` `app.js`

```js
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败')
})
```

`个人中心`
--

`1. 获取用户的基本信息`

`! 实现步骤` `1. 初始化 路由 模块` `2. 初始化 路由处理函数 模块` `3. 获取用户的基本信息`

`1.1 初始化路由模块`

`1.1.1 创建路由模块并初始化的代码结构` `/router/userinfoRouter.js`

```js
const express = require('express')
const router = express.Router()

router.get('/userinfo', (req, res) => { res.send('OK') })

module.exports = router
```

`1.1.2 导入并使用个人中心的路由模块` `app.js`

```js
const userinfoRouter = require('./router/userinfoRouter')
app.use('/t', userinfoRouter)
```

`1.2 初始化路由处理函数模块`

`1.2.1 创建路由处理函数模块并初始化的代码结构` `/router_handler/userinfoRouterHandler.js`

```js
const getUserInfo = (req, res) => {}
module.exports = { getUserInfo }

```

`1.2.2 修改代码` `/router/userinfoRouter.js`

```js
const express = require('express')
const router = express.Router()

const userInfo = require('../router_handler/userInfoRouterHandler.js')
router.get('/userinfo', userInfo.getUserInfo)

module.exports = router
```

`1.3 获取用户的基本信息`

`1.3.1 导入数据库操作模块` `/router_handler/userinfoRouterHandler.js`

```js
const db = require('../database/connect.js')
```

`1.3.2 定义 SQL 语句`

```js
--根据用户的 id 查询用户的基本信息 注意为了防止用户的密码泄露 需要排除 password 字段
const sql = `select id, username, nickname, email, user_pic from users where id=?`
```

`1.3.3 执行 SQL 语句`

```js
--注意 req 对象上的 user 属性 是 Token 解析成功 express-jwt 中间件帮我们挂载上去的
db.query(sql, req.user.id, (err, results) => {
  if (err) return res.cc(err)
  if (results.length !== 1) return res.cc('获取用户信息失败')
  res.send({
    status: 0,
    message: '获取用户基本信息成功',
    data: results[0]
  })
})
```

`2. 更新用户的基本信息`

`! 实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 实现更新用户基本信息的功能`

`2.1 定义路由和处理函数`

`1. 新增更新用户基本信息的路由` `/router/userinfoRouter.js`

```js
router.post('/userinfo', userInfo.updateUserInfo)
```

`2. 定义并向外共享 更新用户基本信息 的路由处理函数` `/router_handler/userinfoRouterHandler.js`

```js
const updateUserInfo = (req, res) => {}
module.exports = { getUserInfo, updateUserInfo }
```

`2.2 验证表单数据`

`1. 在 验证规则模块中 定义 id nickname email 的验证规则` `/inspect/userinfoInspect.js`

```js
--定义 id nickname emial 的验证规则
const id = joi.number().integer().min(1).required()
const nickname = joi.string().required()
const email = joi.string().email().required()
```

`2. 向外共享验证规则对象`

```js
const UserInfoInspect = {
    body: {
        id,
        nickname,
        email,
    },
}
module.exports = { UserInfoInspect }
```

`3. 导入验证数据合法性的中间件` `/router/userinfoRouter.js`

```js
const expressJoi = require('@escook/express-joi')
```

`4. 导入需要的验证规则对象` `/router/userinfoRouter.js`

```js
const { UserInfoInspect } = require('../inspect/userInfoInspect.js')
```

`5. 修改 更新用户的基本信息 的路由` `/router/userinfoRouter.js`

```js
router.post('/userinfo', expressJoi(UserInfoInspect), userInfo.updateUserInfo)
```

`2.3 实现更新用户基本信息的功能`

`1. 定义待执行的 SQL 语句`

```js
const sql = `update users set ? where id=?`
```

`2. 执行 SQL 语句并传参`

```js
db.query(sql, [req.body, req.body.id], (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows `!== 1) return res.cc('修改用户基本信息失败')`
  return res.cc('修改用户基本信息成功', 0)
})
```

`3. 重置密码`

`! 实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 实现重置密码的功能`

`3.1 定义路由和处理函数`

`1. 新增 重置密码 的路由` `/router/userinfoRouter.js`

```js
router.post('/userinfo/resetting', userInfo.resettingPassword)
```

`2. 向外共享 重置密码 的路由处理函数` `/router_handler/userinfoRouterHandler.js`

```js
const resettingPassword = (req, res) => {}
module.exports = { getUserInfo, updateUserInfo, resettingPassword }
```

`3.2 验证表单数据`

`核心验证思路旧密码与新密码 必须符合密码的验证规则 并且新密码不能与旧密码一致`

`1. 向外共享验证规则对象` `/inspect/userinfoInspect.js`

```js
const password = joi.string().pattern(/^[\S]{6,12}$/).required()

const resettingPasswordInspect = {
    body: {
        --使用 password 这个规则 验证 oldPwd 的值
        oldPassword: password,

        --使用 joi.not(joi.ref('oldPwd')).concat(password) 规则 验证 newPwd 的值
        --joi.ref('oldPwd') 表示 newPwd 的值必须和 oldPwd 的值保持一致
        --joi.not(joi.ref('oldPwd')) 表示 newPwd 的值不能等于 oldPwd 的值
        --joi.concat 用于合并 joi.not(joi.ref('oldPwd')) 和 password 这两条验证规则
        newPassword: joi.not(joi.ref('oldPassword')).concat(password)
    }
}
```

`2. 导入需要的验证规则对象` `/router/userinfoRouter.js`

```js
const { resettingPasswordInspect } = require('../inspect/userInfoInspect.js')
```

`3. 重置密码的路由 resettingPasswordInspect 规则验证表单的数据`

```js
router.post('/userinfo/resetting', expressJoi(resettingPasswordInspect), userInfo.resettingPassword)
```

`3.3 实现重置密码的功能`

`1. 根据 id 查询用户是否存在`

```js
const sql = `select * from users where id=?`

db.query(sql, req.user.id, (err, results) => {
  if (err) return res.cc(err)
  if (results.length !== 1) return res.cc('用户不存在')
})
```

`2. 判断提交的 旧密码 是否正确`

```js
const bcrypt = require('bcryptjs')
const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
if (! compareResult) return res.cc('原密码错误')
```

`3. 对新密码进行加密之后更新到数据库中`


```js
const sql = `update users set password=? where id=?`

const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

db.query(sql, [newPwd, req.user.id], (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('更新密码失败')
  res.cc('更新密码成功', 0)
})
```

`4. 更新用户头像`

`! 实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 实现更新用户头像的功能`

`4.1 定义路由和处理函数`

`1. 新增 更新用户头像 的路由` `/router/userinfoRouter.js`

```js
router.post('/userinfo/avatar', userInfo.updateAvatar)
```

`2. 定义并向外共享更新用户头像的路由处理函数` `/router_handler/userinfoRouterHandler.js`

```js
const updateAvatar = (req, res) => {}
module.exports = { getUserInfo, updateUserInfo, resettingPassword, updateAvatar, }
```

`4.2 验证表单数据`

`1. 定义 avatar 的验证规则` `/inspect/userinfoInspect.js`

```js
--dataUri 指的是格式的字符串数据 image png base64 VE9PTUFOWVNFQ1JFVFM
const avatar = joi.string().dataUri().required()
```

`2.  向外共享的验证规则对象`

```js
updateAvatarInspect = {
    body: {
        avatar,
    },
}

module.exports = { updateAvatarInspect }
```

`3. 导入需要的验证规则对象` `/router/userinfoRouter.js`

```js
const { updateAvatarInspect } = require('../inspect/userInfoInspect.js')
```

`4. 修改 更新用户头像 的路由` `/router/userinfoRouter.js`

```js
router.post('/userinfo/avatar', expressJoi(updateAvatarInspect), userInfo.updateAvatar)
```

`4.3 实现更新用户头像的功能`

`1. 定义更新用户头像的 SQL 语句`

```js
const sql = 'update users set user_pic=? where id=?'
```

`2. 执行 SQL 语句 更新对应用户的头像`

```js
db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('更新头像失败')
  return res.cc('更新头像成功', 0)
})
```

`文章分类管理`
--

`1. 新建 article_classification`

`1.1 创建表结构`

```sql
CREATE TABLE `db_01`.`article_classification` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `alias` VARCHAR(255) NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0 You',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `alias_UNIQUE` (`alias` ASC) VISIBLE);
```

`1.2 新增两条初始数据`

```sql
INSERT INTO `db_01`.`article_classification` (`name`, `alias`) VALUES ('科技', 'KeJi');
INSERT INTO `db_01`.`article_classification` (`name`, `alias`) VALUES ('历史', 'LiShi');
```

`2. 获取文章分类列表`

`2.0 实现步骤` `1. 初始化路由模块` `2. 初始化路由处理函数模块` `3. 获取文章分类列表数据`

`2.1 初始化路由模块`

`1. 创建路由初始化的代码结构` `/router/artcateRouter.js`

```js
const express = require('express')
const router = express.Router()

router.get('/artcates', res.send('OK'))

module.exports = router
```

`2. 导入并使用文章分类的路由模块` `app.js`

```js
const artCateRouter = require('./router/artcateRouter.js')
app.use('/t/artcate', artCateRouter)
```

`2.2 初始化路由处理函数模块`

`1. 创建路由处理函数模块并初始化的代码结构` `/router_handler/artcateRouterHandler.js`

```js
const getArticleCates = (req, res) => {}
module.exports = { getArticleCates }
```

`2. 修改代码` `/router/artcateRouter.js`

```js
const express = require('express')
const router = express.Router()

const artcates = require('../router_handler/artcateRouterHandler.js')
router.get('/artcates', artcates.getArticleCates)

module.exports = router
```

`2.3 获取文章分类列表数据`

`1. 导入数据库操作模块` `/router_handler/artcateRouterHandler.js`

```js
const db = require('../database/connect.js')
```

`2. 定义 SQL 语句`

```js
--根据分类的状态获取所有未被删除的分类列表数据 status 为 0 表示没有被 标记为删除 的数据
const sql = 'select * from article_classification where status=0 order by id asc'
```

`3. 执行 SQL 语句`

```js
db.query(sql, (err, results) => {
  if (err) return res.cc(err)
  res.send({
    status: 0,
    message: '获取文章分类列表成功',
    data: results,
  })
})
```

`3. 新增文章分类`

`实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 查询 分类名称 与 分类别名 是否被占用` `4. 实现新增文章分类的功能`

`3.1 定义路由和处理函数`

`1. 添加新增文章分类的路由` `/router/artcateRouter.js`

```js
router.post('/artcates/increase', artcates.articleCatesIncrease)
```

`2. 定义并向外共享新增文章分类的路由处理函数` `/router_handler/artcateRouterHandler.js`

```js
const articleCatesIncrease = (req, res) => {}
module.exports = { getArticleCates, articleCatesIncrease }
```

`3.2 验证表单数据`

`1. 创建文章分类数据验证模块并定义的验证规则` `/inspect/artcateInspect.js`

```js
const joi = require('@hnt/joi')
const name = joi.string().required()
const alias = joi.string().alphanum().required()

const artcatesIncreaseInspect = {
    body: { name, alias }
}

module.exports = { artcatesIncreaseInspect }
```

`2. 使用 artcatesIncreaseInspect 对数据进行验证` `/router/artcateRouter.js`

```js
const expressJoi = require('@escook/express-joi')

const { artcatesIncreaseInspect } = require('../inspect/artcateInspect.js')
router.post('/artcates/increase', expressJoi(artcatesIncreaseInspect), artcates.articleCatesIncrease)
```

`3.3 查询分类名称与别名是否被占用`

`1. 定义查重的 SQL 语句`

```js
const sql = `select * from article_classification where name=? or alias=?`
```

`2. 执行查重的操作`

```js
db.query(sql, [req.body.name, req.body.alias], (err, results) => {
  if (err) return res.cc(err)
  if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试')
  if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试')
  if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试')
})
```

`3.4 实现新增文章分类的功能`

`1. 定义新增文章分类的 SQL 语句`

```js
const sql = `insert into article_classification set ?`
```

`2. 执行新增文章分类的 SQL 语句`

```js
db.query(sql, req.body, (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('新增文章分类失败')
  res.cc('新增文章分类成功', 0)
})
```

`4. 根据 Id 删除文章分类`

`实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 实现删除文章分类的功能`

`4.1 定义路由和处理函数`

`1. 添加 删除文章分类 的路由` `/router/artcateRouter.js`

```js
router.get('/artcates/deletecate/:id', artcates.deleteArtcateId)
```

`2. 定义并向外共享 删除文章分类 的路由处理函数` `/router_handler/artcateRouterHandler.js`

```js
const deleteArtcateId = (req, res) => {}
module.exports = { getArticleCates, articleCatesIncrease, deleteArtcateId }
```

`4.2 验证表单数据`

`1. 在 验证规则模块中 定义 id 的验证规则` `/inspect/artcateInspect.js`

```js
const id = joi.number().integer().min(1).required()
```

2. 并使用 `exports` 向外共享的 `验证规则对象`

```js
const getArticleCatesIdInspect = {
    params: { id }
}
module.exports = { artcatesIncreaseInspect, deleteArtcateIdInspect, getArticleCatesIdInspect }
```

`3. 导入需要的验证规则对象并在路由中使用` `/router/artcateRouter.js`

```js
const { deleteArtcateIdInspect } = require('../inspect/artcateInspect.js')
router.get('/artcates/deletecate/:id', expressJoi(deleteArtcateIdInspect), artcates.deleteArtcateId)
```

`4.3 实现删除文章分类的功能`

`1. 定义删除文章分类的 SQL 语句`

```js
const sql = `update article_classification set status=1 where id=?`
```

`2. 执行删除文章分类的 SQL 语句`

```js
db.query(sql, req.params.id, (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('删除文章分类失败')
  res.cc('删除文章分类成功', 0)
})
```

`5. 根据 Id 获取文章分类数据`

`! 实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 实现获取文章分类的功能`

`5.1 定义路由和处理函数`

`1. 添加 根据 Id 获取文章分类 的路由` `/router/artcateRouter.js`

```js
router.get('/artcates/:id', artcates.getArticleCatesId)
```

`2. 定义并向外共享 根据 Id 获取文章分类 的路由处理函数` `/router_handler/artcateRouterHandler.js`

```js
const getArticleCatesId = (req, res) => {}
module.exports = { getArticleCates, articleCatesIncrease, deleteArtcateId, getArticleCatesId }
```

`5.2 验证表单数据`

`1. 在验证规则模块中向外共享的验证规则对象` `/inspect/artcateInspect.js`

```js
const getArticleCatesIdInspect = {
    params: { id }
}
module.exports = { artcatesIncreaseInspect, deleteArtcateIdInspect, getArticleCatesIdInspect }
```

`2. 导入需要的验证规则对象并在路由中使用 ``/router/artcateRouter.js`

```js
const { getArticleCatesIdInspect } = require('../inspect/artcateInspect.js')
router.get('/artcates/:id',expressJoi(getArticleCatesIdInspect), artcates.getArticleCatesId)
```

`5.3 实现获取文章分类的功能`

`1. 定义根据 Id 获取文章分类的 SQL 语句`

```js
const sql = `select * from article_classification where id=?`
```

`2. 执行 SQL 语句`

```js
db.query(sql, req.params.id, (err, results) => {
  if (err) return res.cc(err)
  if (results.length `>== 1) return res.cc('获取文章分类数据失败')`
  res.send({
    status: 0,
    message: '获取文章分类数据成功',
    data: results[0],
  })
})
```

`6. 根据 Id 更新文章分类数据`

`! 实现步骤` `1. 定义路由和处理函数` `2. 验证表单数据` `3. 查询 分类名称 与 分类别名 是否被占用` `4. 实现更新文章分类的功能`

`6.1 定义路由和处理函数`

`1. 添加 更新文章分类 的路由` `/router/artcateRouter.js`

```js
router.post('/artcates/updatecate/:id', artcates.updateArticleCateId)
```

`2. 定义并向外共享 更新文章分类 的路由处理函数` `/router_handler/artcateRouterHandler.js`

```js
const updateArticleCateId = (req, res) => {}
module.exports = { getArticleCates, articleCatesIncrease, deleteArtcateId, getArticleCatesId, updateArticleCateId }
```

`6.2 验证表单数据`

`1. 在验证规则模块中向外共享的验证规则对象` `/inspect/artcateInspect.js`

```js
const updateArticleCateIdInspect = {
    body: { Id: id, name, alias }
}
module.exports = { artcatesIncreaseInspect, deleteArtcateIdInspect, getArticleCatesIdInspect, updateArticleCateIdInspect }
```

`2. 导入需要的验证规则对象并在路由中使用` `/router/artcateRouter.js`

```js
const { updateArticleCateIdInspect } = require('../inspect/artcateInspect.js')
router.post('/artcates/updatecate/:id', expressJoi(updateArticleCateIdInspect), artcates.updateArticleCateId)
```

`5.4 查询分类名称与别名是否被占用`

`1. 定义查重的 SQL 语句`

```js
const sql = `select * from article_classification where Id<>? and (name=? or alias=?)`
```

`2. 执行查重的操作`

```js
db.query(sql, [req.body.Id, req.body.name, req.body.alias], (err, results) => {
  if (err) return res.cc(err)
  if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试')
  if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试')
  if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试')
})
```

`5.5 实现更新文章分类的功能`

`1. 定义更新文章分类的 SQL 语句`

```js
const sql = `update article_classification set ? where Id=?`
```

`2. 执行 SQL 语句`

```js
db.query(sql, [req.body, req.body.Id], (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('更新文章分类失败')
  res.cc('更新文章分类成功', 0)
})
```

`文章管理`
--

`1. 新建 articles`

```sql
CREATE TABLE `db_01`.`articless` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `book_corver` VARCHAR(255) NOT NULL,
  `date` VARCHAR(255) NOT NULL,
  `state` VARCHAR(255) NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 0,
  `artcate_id` VARCHAR(255) NOT NULL,
  `author_id` INT NOT NULL,
  `articlesscol` INT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC) VISIBLE);
```

`2. 发布新文章`

`实现步骤` `1. 初始化路由模块` `2. 初始化路由处理函数模块` `3. 使用 multer 解析表单数据` `4. 验证表单数据` `5. 实现发布文章的功能`

`2.1 初始化路由模块`

`1. 创建路由模块并初始化的代码结构` `/router/articleRouter.js`

```js
const express = require('express')
const router = express.Router()

router.post('/artcles/increase', upload.single('book_corver') article.articleIncrease)

module.exports = router
```

`2. 导入并使用文章的路由模块` `app.js`

```js
const articleRouter = require('./router/articleRouter.js')
app.use('/t/article', articleRouter)
```

`2.2 初始化路由处理函数模块`

`1. 创建路由处理函数模块并初始化的代码结构` `/router_handler/articleRouterHandler.js`

```js
const articleIncrease = (req, res) => {}
module.exports = { articleIncrease }
```

`2. 修改的代码` `/router/articleRouter.js`

```js
const express = require('express')
const router = express.Router()

const article = require('../router_handler/articleRouterHandler.js')
router.post('/artcles/increase', article.articleIncrease)

module.exports = router
```

`2.3 使用 multer 解析表单数据`

`注意使用 express.urlencoded 中间件无法解析 multipart/form-data 格式的请求体数据` `当前项目 推荐使用 multer 来解析 multipart/form-data 格式的表单数据`

`1. 安装 multer` `npm i multer@1.4.2`

`2. 导入并配置 multer` `/router/articleRouter.js`

```js
const multer = require('multer')
const path = require('path')
const upload = multer({ dest: path.join(__dirname, '../uploads') })
```

`3. 修改 发布新文章 的路由`

```js
--upload.single 是一个局部生效的中间件用来解析 FormData 格式的表单数据
--将文件类型的数据解析并挂载到 req.file 属性中
--将文本类型的数据解析并挂载到 req.body 属性中
router.post('/artcles/increase', upload.single('book_corver'), article.articleIncrease)
```

`4. 在 addArticle 处理函数中 将 multer 解析出来的数据进行打印` `/router_handler/articleRouterHandler.js`

```js
const articleIncrease = (req, res) => {
  console.log(req.body)
  console.log(req.file)
}
```

`2.4 验证表单数据`

`实现思路通过 express-joi 自动验证 req.body 中的文本数据 通过 if 判断手动验证 req.file 中的文件数据`

`1. 创验证规则模块并初始化的代码结构` `/inspect/articleInspect.js`

```js
const joi = require('@hapi/joi')

const title = joi.string().required()
const artcate_id = joi.number().integer().min(1).required()
const content = joi.string().required().allow('')
const state = joi.string().valid('已发布', '草稿').required()

const articleIncreaseInspect = {
    body: { title, artcate_id, content, state }
}
 
module.exports = { articleIncreaseInspect }
```

`2. 导入需要的验证规则对象并在路由中使用` `/router/articleRouter.js`

```js
const expressJoi = require('@escook/express-joi')

--注意在当前的路由中先后使用了两个中间件 先使用 multer 解析表单数据 再使用 expressJoi 对解析的表单数据进行验证
const articleIncreaseInspect = require('../inspect/articleInspect.js')
router.post('/artcles/increase', upload.single('book_corver'), expressJoi(articleIncreaseInspect), article.articleIncrease)
```

`3. 在模块中的 addArticle 处理函数中 通过 if 判断客户端是否提交了封面图片` `/router_handler/articleRouterHandler.js`

```js
const articleIncrease = (req, res) => {
    if (!req.file || req.file.fieldname !== 'book_corver') return res.cc('文章封面是必选参数')
}
```

`2.5 实现发布文章的功能`

`1. 整理要插入数据库的文章信息对象`

```js
const path = require('path')

const articleInfo = {
    ...req.body,
    book_corver: path.join('/uploads', req.file.filename),
    date: new Date(),
    author_id: req.user.id,
}
```

`2. 定义发布文章的 SQL 语句`

```js
const sql = `insert into articles set ?`
```

`3. 执行发布文章的 SQL 语句`

```js
const db = require('../database/connect.js')

db.query(sql, articleInfo, (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('发布文章失败')
  res.cc('发布文章成功', 0)
})
```

`4. 使用 express.static 中间件将 uploads 目录中的图片托管为静态资源` `app.js`

```js
app.use('/uploads', express.static('./uploads'))
```
