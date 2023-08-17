const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash')

// Settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));    
var conn = require("./db.js")

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'mysecretkey',
    revase: false,
    saveUninitialized: false
}));
app.use(flash());

// Routes
app.use(require('./routes/index'));


app.listen(3000,()=>{
    console.log('Escuchando en el puerto 3000')
})