const mysql = require('mysql2');

// Railway/本地都兼容的 DB 配置
const dbHost = process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost';
const dbPort = parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || '3306', 10);
const dbUser = process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
const dbPassword = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '';
const dbName = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'what_to_eat';

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 10000,
  acquireTimeout: 10000
});

pool.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ MySQL 连接失败:', err.code, err.message);
    console.error('检查 MYSQLHOST/MYSQLPORT/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE 环境变量');
    return;
  }
  console.log('✅ MySQL 连接成功，host:', dbHost, 'db:', dbName);
});

module.exports = pool;


