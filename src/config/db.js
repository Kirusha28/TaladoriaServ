const mongoose = require('mongoose'); // Импортируем Mongoose для взаимодействия с MongoDB

require('dotenv').config(); // Загружаем переменные окружения из .env

const connectDB = async () => {
  try {
    // Подключаемся к базе данных MongoDB, используя URI из переменных окружения
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB успешно подключена.'); // Выводим сообщение об успешном подключении
  } catch (err) {
    console.error('Ошибка подключения к MongoDB:', err.message); // Выводим сообщение об ошибке
    process.exit(1); // Завершаем процесс с ошибкой
  }
};

module.exports = connectDB; // Экспортируем функцию подключения к базе данных
