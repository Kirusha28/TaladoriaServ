const jwt = require('jsonwebtoken'); // Импортируем jsonwebtoken
const jwtConfig = require('../config/jwt'); // Импортируем конфигурацию JWT

// Функция для генерации JWT
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn, // Время истечения срока действия токена
  });
};

module.exports = generateToken; // Экспортируем функцию генерации токена
