const articleIncrease = (req, res) => {
    if (!req.file || req.file.fieldname !== 'book_corver') return res.cc('文章封面是必选参数')
        
    const path = require('path')

    const articleInfo = {
        ...req.body,
        book_corver: path.join('/uploads', req.file.filename),
        date: new Date(),
        author_id: req.user.id,
    }

    const sql = `insert into articles set ?`

    const db = require('../database/connect.js')

    db.query(sql, articleInfo, (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('发布文章失败！')
        res.cc('发布文章成功', 0)
    })

}
 
module.exports = { articleIncrease }