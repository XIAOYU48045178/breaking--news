const db = require('../database/connect.js')

const getArticleCates = (req, res) => {
    const sql = 'select * from article_classification where status=0 order by id asc'
    db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        res.send({ status: 0, message: '获取文章分类列表成功', data: results })
    })
}

const articleCatesIncrease = (req, res) => {
    const sql = `select * from article_classification where name=? or alias=?`
    db.query(sql, [req.body.name, req.body.alias], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 2) return res.cc('分类名称与别名被占用 请更换后重试')
        if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用 请更换后重试')
        if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用 请更换后重试')
    })

    const sql1 = `insert into article_classification set ?`
    db.query(sql1, req.body, (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('新增文章分类失败！')
        res.cc('新增文章分类成功', 0)
    })
}

const deleteArtcateId = (req, res) => {
    const sql = `update article_classification status=1 where id=?`
    db.query(sql, req.params.id, (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('删除文章分类失败')
        res.cc('删除文章分类成功', 0)
    })
}

const getArticleCatesId = (req, res) => {
    const sql = `select * from article_classification where id=?`
    db.query(sql, req.params.id, (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) return res.cc('获取文章分类数据失败')

        res.send({
            status: 0,
            message: '获取文章分类数据成功',
            data: results[0],
        })
    })
}

const updateArticleCateId = (req, res) => {
    const sql = `select * from article_classification where Id<>? and (name=? or alias=?)`
    db.query(sql, [req.body.Id, req.body.name, req.body.alias], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试')
        if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试')
        if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试')
    })

    const sql1 = `update article_classification set ? where Id=?`
    db.query(sql1, [req.body, req.body.Id], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('更新文章分类失败')
        res.cc('更新文章分类成功', 0)
    })
}

module.exports = { getArticleCates, articleCatesIncrease, deleteArtcateId, getArticleCatesId, updateArticleCateId }
