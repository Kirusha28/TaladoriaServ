require("dotenv").config();

// Экспортируем основные конфигурационные переменные
module.exports = {
	port: process.env.PORT || 4000, // Порт сервера, по умолчанию 3000
	env: process.env.NODE_ENV || "development", // Среда выполнения (разработка, продакшн и т.д.)
};
