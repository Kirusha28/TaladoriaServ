const express = require('express'); // Импортируем Express
const passport = require('passport'); // Импортируем Passport
const {
  loginUser,
  discordCallback,
  getMe,
} = require('../controllers/authController'); // Импортируем контроллеры аутентификации
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

console.log('Файл authRoutes загружен');
// Инициализируем сервисы аутентификации (чтобы Passport.js загрузил стратегии)
require('../services/discordAuthService');

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для входа пользователя
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Маршрут для начала аутентификации через Discord
console.log('Регистрирую роут GET /discord');
router.get(
  '/discord',
  passport.authenticate('discord', { scope: ['identify'] }) // Запрашиваем идентификатор и email
);


console.log('Регистрирую роут GET /discord/callback');
router.get('/discord/callback', (req, res, next) => {
  // Вызываем кастомный обработчик passport
  passport.authenticate('discord', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Внутренняя ошибка сервера", error: err });
    }

    // Если стратегия вернула false (пользователь не найден)
    if (!user) {
      return res.status(404).json({ 
        message: "Пользователь не найден. Пожалуйста, сначала зарегистрируйтесь через форму." 
      });
    }

    try {
      // Подписываем токен. 
      // ВАЖНО: используем user.id (из нашей MySQL модели)
      // console.log("JWT Token Creating:");
      const token = jwt.sign(
        { user_id: user.user_id }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );
      // console.log("JWT Token:", token);
      // Отправляем данные
      // Вы можете либо отправить JSON, либо сделать редирект на фронтенд с токеном
      res.json({
        token: token,
        user: user
      });

    } catch (error) {
      console.error("JWT Error:", error);
      res.status(500).json({ message: "Ошибка при создании токена" });
    }
  })(req, res, next); // Обязательно вызываем функцию!
});
// **Важно:** Маршруты /auth/success и /auth/failure были удалены,
// так как теперь бэкенд перенаправляет напрямую на клиентское приложение.

module.exports = router; // Экспортируем маршрутизатор
