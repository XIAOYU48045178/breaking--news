const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '48045178',
    database: 'db_01',
})

module.exports = db
