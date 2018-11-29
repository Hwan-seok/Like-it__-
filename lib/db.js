const mysql = require('mysql');
const DB_option = require('./db_option');

module.exports = mysql.createConnection(DB_option);
