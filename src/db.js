var mysql = require("mysql2")
//require('dotenv').config();

var conn = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "1234",
    database: "transglobalexpress"
})

conn.connect((err) => {
    if (err) throw err;
    console.log("Database Connected...")
})

module.exports = conn;