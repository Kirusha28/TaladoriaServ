const nodemailer = require('nodemailer'); // Импортируем Nodemailer
require('dotenv').config(); // Загружаем переменные окружения

// Создаем транспорт для Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // Например, 'gmail'
  host: process.env.EMAIL_HOST, // Если не Gmail, например 'smtp.example.com'
  port: process.env.EMAIL_PORT, // Порт SMTP, например 587 или 465
  secure: process.env.EMAIL_SECURE === 'true', // true для 465, false для других портов
  auth: {
    user: process.env.EMAIL_USER, // Ваш email
    pass: process.env.EMAIL_PASS, // Пароль вашего email или пароль приложения
  },
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Отправитель
      to, // Получатель
      subject, // Тема письма
      text, // Текст письма (обычный текст)
      html, // HTML-версия письма (если есть)
    };

    // Отправляем письмо
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо отправлено: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    return { success: false, error: error.message };
  }
};

// Пример для будущего расширения с Socket.IO для уведомлений в реальном времени
// let io; // Переменная для хранения экземпляра Socket.IO

// const initSocketIO = (server) => {
//   io = require('socket.io')(server);
//   io.on('connection', (socket) => {
//     console.log('Новое соединение Socket.IO:', socket.id);
//     // Здесь можно добавить логику для аутентификации сокетов и присоединения к комнатам
//   });
// };

// const sendRealtimeNotification = (userId, message) => {
//   if (io) {
//     // Отправляем уведомление конкретному пользователю или в комнату
//     io.to(userId).emit('notification', message);
//     console.log(`Уведомление в реальном времени отправлено пользователю ${userId}: ${message}`);
//   } else {
//     console.warn('Socket.IO не инициализирован. Уведомление в реальном времени не отправлено.');
//   }
// };

module.exports = {
  sendEmail,
  // initSocketIO, // Раскомментируйте, если будете использовать Socket.IO
  // sendRealtimeNotification, // Раскомментируйте, если будете использовать Socket.IO
};
