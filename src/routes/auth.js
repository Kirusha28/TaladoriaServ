const express = require('express'); // Импортируем Express
const passport = require('passport'); // Импортируем Passport
const {
  registerUser,
  loginUser,
  googleCallback,
  discordCallback,
} = require('../controllers/authController'); // Импортируем контроллеры аутентификации

// Инициализируем сервисы аутентификации (чтобы Passport.js загрузил стратегии)
require('../services/googleAuthService');
require('../services/discordAuthService');

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для регистрации пользователя
router.post('/register', registerUser);

// Маршрут для входа пользователя
router.post('/login', loginUser);

// Маршрут для начала аутентификации через Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) // Запрашиваем профиль и email
);

// Маршрут обратного вызова Google (здесь Passport обрабатывает ответ от Google)
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure', session: false }), // session: false, так как используем JWT
  googleCallback
);

// Маршрут для начала аутентификации через Discord
router.get(
  '/discord',
  passport.authenticate('discord', { scope: ['identify', 'email'] }) // Запрашиваем идентификатор и email
);

// Маршрут обратного вызова Discord (здесь Passport обрабатывает ответ от Discord)
router.get(
  '/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/failure', session: false }), // session: false, так как используем JWT
  discordCallback
);

// **Важно:** Маршруты /auth/success и /auth/failure были удалены,
// так как теперь бэкенд перенаправляет напрямую на клиентское приложение.

module.exports = router; // Экспортируем маршрутизатор
