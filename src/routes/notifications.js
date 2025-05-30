const express = require('express'); // Импортируем Express
const { sendTestEmail } = require('../controllers/notificationController'); // Импортируем контроллер уведомлений
const { protect } = require('../middleware/authMiddleware'); // Импортируем промежуточное ПО для защиты маршрутов

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для отправки тестового письма (защищенный маршрут)
router.post('/send-email', protect, sendTestEmail);

// Маршрут для отправки уведомления в реальном времени (пример, если Socket.IO будет использоваться)
// router.post('/send-realtime', protect, sendRealtimeNotification);

module.exports = router; // Экспортируем маршрутизатор
