const express = require('express'); // Импортируем Express
const { getUserProfile, getUserById, getAllUsers } = require('../controllers/userController'); // Импортируем контроллер пользователя
const { protect } = require('../middleware/authMiddleware'); // Импортируем промежуточное ПО для защиты маршрутовconst { getMe, ... } = require('../controllers/authController');
const { getMe } = require('../controllers/authController');

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для получения профиля пользователя (защищенный маршрут)
router.get('/profile', protect, getUserProfile);
// Маршрут защищен мидлваром protect
router.get('/me', protect, getMe);
router.get('/getUserById', protect, getUserById);
router.get('/getAllUsers', protect, getAllUsers);


module.exports = router; // Экспортируем маршрутизатор
