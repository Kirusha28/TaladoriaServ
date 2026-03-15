const Global = require('../models/Global'); // Импортируем модель User

// @desc    Получить общее время в голосовых каналах
// @route   GET /api/users/totalMinutes
// @access  Private
const getTotalMinutes = async (req, res) => {
  // Мидлвар protect уже нашел пользователя и положил его в req.user
  const stats = await Global.getTotalMinutes();
  
  if (stats) {
    res.json({ totalVoiceTime: stats }); 
  } else {
    res.status(500).json({ message: 'Я не математик' });
  }
};

module.exports = {
  getTotalMinutes,
};
