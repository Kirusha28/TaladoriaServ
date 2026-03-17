const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306, // Явно указываем порт
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // Настройки пула
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Критично для УДАЛЕННЫХ соединений:
  enableKeepAlive: true, 
  keepAliveInitialDelay: 10000, // Пинг каждые 10 секунд
  
  // Правильная работа с текстом
  charset: 'utf8mb4',

  // Если сервер требует SSL (раскомментируй, если нужно):
  // ssl: { rejectUnauthorized: false } 
});


module.exports = pool;