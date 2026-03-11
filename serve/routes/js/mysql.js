var express = require('express');
var router = express.Router();

//引入mysql
const mysql = require('mysql');

//创建连接对象
// const connection = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"123456",
//     database:"what_to_eat"
// })

// //执行连接方法
// connection.connect();
// console.log("mysql连接成功")
// //暴露连接对象
// module.exports = connection;


// 用 Railway 的真实 DB 配置，兼容两种变量命名
const dbHost = process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const dbPort = parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10);
const dbUser = process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
const dbPassword = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '';
const dbName = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'what_to_eat';

const connection = mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectTimeout: 10000,
  acquireTimeout: 10000
});

// 正确处理连接
connection.connect(function(err) {
  if (err) {
    console.error('❌ MySQL 连接失败:', err.code, err.message);
    console.error('检查 MYSQLHOST/MYSQLPORT/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE 环境变量');
    return;
  }
  console.log('✅ MySQL 连接成功，host:', dbHost, 'db:', dbName);
});

// 必须加这个，防止 Unhandled error crash
connection.on('error', function(err) {
  console.error('MySQL 连接池错误:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    // 可选：自动重连逻辑
    console.log('尝试重连 MySQL...');
  }
});

module.exports = connection;  // 导出给其他文件用


