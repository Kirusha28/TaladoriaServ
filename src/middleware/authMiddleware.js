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
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Несанкционированный доступ, токен недействителен' });
    }
  }

  // Если токен не предоставлен
  if (!token) {
    return res.status(401).json({ message: 'Несанкционированный доступ, токен отсутствует' });
  }
};

module.exports = { protect }; // Экспортируем промежуточное ПО protect
