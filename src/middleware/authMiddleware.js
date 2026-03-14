const jwt = require('jsonwebtoken'); // Импортируем jsonwebtoken
const User = require('../models/User'); // Импортируем модель User
const jwtConfig = require('../config/jwt'); // Импортируем конфигурацию JWT

const protect = async (req, res, next) => {
  let token;

  // Проверяем, есть ли токен в заголовках авторизации
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Извлекаем токен из заголовка "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Проверяем токен
      const decoded = jwt.verify(token, jwtConfig.secret);

      // Находим пользователя по ID из токена и прикрепляем его к объекту запроса
      req.user = await User.findById(decoded.id).select('-password'); // Исключаем пароль
      if (!req.user) {
        return res.status(401).json({ message: 'Несанкционированный доступ, пользователь не найден' });
      }
      next(); // Переходим к следующему промежуточному ПО или обработчику маршрута
      // Измените ваш блок catch в authMiddleware.js
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Срок действия сессии истек. Войдите заново.' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Неверный токен.' });
      }
      
      console.error(error); // Оставляем для других неизвестных ошибок
      return res.status(401).json({ message: 'Несанкционированный доступ' });
    }
  }

  // Если токен не предоставлен
  if (!token) {
    return res.status(401).json({ message: 'Несанкционированный доступ, токен отсутствует' });
  }
};

module.exports = { protect }; // Экспортируем промежуточное ПО protect
