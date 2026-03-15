const express = require("express"); // Импортируем Express

const { protect } = require("../middleware/authMiddleware");
const {
	getTotalMinutes,
	getTotalUsersCount,
	getTotalAchievements,
	getTotalOnline,
} = require("../controllers/globalController");

const router = express.Router(); // Создаем новый маршрутизатор Express

// Маршрут для входа пользователя
router.get("/getTotalMinutes", protect, getTotalMinutes);
router.get("/getTotalUsersCount", protect, getTotalUsersCount);
router.get("/getTotalAchievements", protect, getTotalAchievements);
router.get("/getTotalOnline", protect, getTotalOnline);

module.exports = router; // Экспортируем маршрутизатор
