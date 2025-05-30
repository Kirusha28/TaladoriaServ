const express = require('express'); // Импортируем Express
const { getUserProfile } = require('../controllers/userController'); // Импортируем контроллер пользователя
const { protect } = require('../middleware/authMiddleware'); // Импортируем промежуточное ПО для защиты маршрутов

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для получения профиля пользователя (защищенный маршрут)
router.get('/profile', protect, getUserProfile);

module.exports = router; // Экспортируем маршрутизатор
