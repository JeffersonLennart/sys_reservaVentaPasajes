var mysql = require("mysql2")
//require('dotenv').config();

var conn = mysql.createConnection({
    host: "10.10.28.14",
    user: "user",
    password: "1234",
    database: "transglobalexpress"
})

conn.connect((err) => {
    if (err) throw err;
    console.log("Database Connected...")
})

module.exports = conn;