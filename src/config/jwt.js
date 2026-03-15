require('dotenv').config(); // Загружаем переменные окружения

// Экспортируем конфигурацию JWT
module.exports = {
  secret: process.env.JWT_SECRET, // Секретный ключ для подписи JWT
  expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Время истечения срока действия токена, по умолчанию 1 час
};
