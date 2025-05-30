const notificationService = require('../services/notificationService'); // Импортируем сервис уведомлений

// @desc    Отправить тестовое уведомление по электронной почте
// @route   POST /api/notifications/send-email
// @access  Private (только для аутентифицированных пользователей)
const sendTestEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Проверяем, что все обязательные поля заполнены
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ message: 'Пожалуйста, укажите получателя, тему и текст/HTML письма' });
  }

  // Отправляем письмо с помощью сервиса уведомлений
  const result = await notificationService.sendEmail(to, subject, text, html);

  if (result.success) {
    res.status(200).json({ message: 'Тестовое письмо успешно отправлено', messageId: result.messageId });
  } else {
    res.status(500).json({ message: 'Не удалось отправить тестовое письмо', error: result.error });
  }
};

// @desc    Отправить уведомление в реальном времени (пример)
// @route   POST /api/notifications/send-realtime
// @access  Private (только для аутентифицированных пользователей)
// const sendRealtimeNotification = async (req, res) => {
//   const { userId, message } = req.body;

//   if (!userId || !message) {
//     return res.status(400).json({ message: 'Пожалуйста, укажите userId и сообщение' });
//   }

//   notificationService.sendRealtimeNotification(userId, message);
//   res.status(200).json({ message: 'Уведомление в реальном времени отправлено (если Socket.IO инициализирован)' });
// };

module.exports = {
  sendTestEmail,
  // sendRealtimeNotification, // Раскомментируйте, если будете использовать Socket.IO
};
