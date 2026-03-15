const express = require('express'); // Импортируем Express

const { protect } = require('../middleware/authMiddleware');
const { getTotalMinutes } = require('../controllers/globalController');


const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для входа пользователя
router.get('/getTotalMinutes', protect, getTotalMinutes);



module.exports = router; // Экспортируем маршрутизатор
