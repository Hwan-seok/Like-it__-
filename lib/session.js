const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db_option = require('./db_option.js');
const sessionStore = new MySQLStore(db_option);
module.exports={
    key: 'Likeit',
    secret: '',
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}