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

// Маршрут для аутентификации через Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }) // Запрашиваем профиль и email
);

// Маршрут обратного вызова Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure', session: false }), // session: false, так как используем JWT
  googleCallback
);

// Маршрут для аутентификации через Discord
router.get(
  '/discord',
  passport.authenticate('discord', { scope: ['identify', 'email'] }) // Запрашиваем идентификатор и email
);

// Маршрут обратного вызова Discord
router.get(
  '/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/auth/failure', session: false }), // session: false, так как используем JWT
  discordCallback
);

// Пример маршрутов для перенаправления после OAuth
// В реальном приложении это будут маршруты на вашем фронтенде
router.get('/auth/success', (req, res) => {
  res.send(`<h1>Аутентификация успешна!</h1><p>Ваш токен: ${req.query.token}</p><p>Сохраните этот токен и используйте его для доступа к защищенным маршрутам.</p>`);
});

router.get('/auth/failure', (req, res) => {
  res.status(401).send('<h1>Аутентификация не удалась :(</h1><p>Пожалуйста, попробуйте еще раз.</p>');
});


module.exports = router; // Экспортируем маршрутизатор
