// Обработчик ошибок для несуществующих маршрутов (404 Not Found)
const notFound = (req, res, next) => {
  const error = new Error(`Не найдено - ${req.originalUrl}`);
  res.status(404);
  next(error); // Передаем ошибку следующему обработчику ошибок
};

// Глобальный обработчик ошибок
const errorHandler = (err, req, res, next) => {
  // Устанавливаем статус ответа: 500 Internal Server Error, если статус уже не установлен
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Отправляем ответ с сообщением об ошибке и стеком вызовов (только в режиме разработки)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Стек вызовов только в режиме разработки
  });
};

module.exports = { notFound, errorHandler }; // Экспортируем оба обработчика
