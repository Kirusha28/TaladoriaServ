const express = require('express'); // Импортируем Express
const passport = require('passport'); // Импортируем Passport
const {
  registerUser,
  loginUser,
  discordCallback,
} = require('../controllers/authController'); // Импортируем контроллеры аутентификации
console.log('Файл authRoutes загружен');
// Инициализируем сервисы аутентификации (чтобы Passport.js загрузил стратегии)
require('../services/discordAuthService');

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для регистрации пользователя
router.post('/register', registerUser);

// Маршрут для входа пользователя
router.post('/login', loginUser);

// Маршрут для начала аутентификации через Discord
console.log('Регистрирую роут GET /discord');
router.get(
  '/discord',
  passport.authenticate('discord', { scope: ['identify', 'email'] }) // Запрашиваем идентификатор и email
);

// Маршрут обратного вызова Discord (здесь Passport обрабатывает ответ от Discord)
// router.get(
//   '/discord/callback',
//   passport.authenticate('discord', { failureRedirect: '/auth/failure', session: false }), // session: false, так как используем JWT
//   discordCallback
// );
// В твоем файле с роутами (например, auth.js)
console.log('Регистрирую роут GET /discord/callback');
router.get('/discord/callback', 
  passport.authenticate('discord', { session: false, failureRedirect: '/login' }), 
  (req, res) => {
    try {
      console.log(req.user);
      // Создаем токен
      // Убедись, что в .env прописан JWT_SECRET
      const token = jwt.sign(
        { id: req.user._id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      // Отправляем JSON обратно на фронтенд
      res.json({
        token: token,
        user: {
          id: req.user.discordId,
          username: req.user.username,
          email: req.user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Ошибка при создании токена" });
    }
  }
);
// **Важно:** Маршруты /auth/success и /auth/failure были удалены,
// так как теперь бэкенд перенаправляет напрямую на клиентское приложение.

module.exports = router; // Экспортируем маршрутизатор
