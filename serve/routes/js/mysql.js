var express = require('express');
var router = express.Router();

//引入mysql
const mysql = require('mysql');

//创建连接对象
var connection = mysql.createConnection({
  host: process.env.MYSQLHOST || 'localhost',
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '123456',
  database: process.env.MYSQLDATABASE || 'what_to_eat'
})

//执行连接方法
connection.connect();
console.log("mysql连接成功")
//暴露连接对象
module.exports = connection;


