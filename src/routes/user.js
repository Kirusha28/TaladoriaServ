const express = require('express'); // Импортируем Express
const { getUserProfile, getUserById, getUserByIdOrUsername, getAllUsers } = require('../controllers/userController'); // Импортируем контроллер пользователя
const { protect } = require('../middleware/authMiddleware'); // Импортируем промежуточное ПО для защиты маршрутов
const { getMe } = require('../controllers/authController');

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для получения профиля пользователя (защищенный маршрут)
router.get('/profile', protect, getUserProfile);
// Маршрут защищен мидлваром protect
router.get('/me', protect, getMe);
router.get('/getUserById', protect, getUserById);
router.get('/getUserByIdOrUsername', protect, getUserByIdOrUsername);
router.get('/getAllUsers', protect, getAllUsers);


module.exports = router; // Экспортируем маршрутизатор
