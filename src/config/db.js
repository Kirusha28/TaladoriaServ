const mysql = require('mysql2/promise'); // Используем версию с поддержкой Promise
require('dotenv').config();

const connectDB = async () => {
  try {
    // Создаем соединение с базой данных
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('MySQL успешно подключена.');
    
    // Возвращаем соединение для дальнейшего использования
    return connection;
  } catch (err) {
    console.error('Ошибка подключения к MySQL:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;