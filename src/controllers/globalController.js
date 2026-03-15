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

const getTotalUsersCount = async (req, res) => {
  // Мидлвар protect уже нашел пользователя и положил его в req.user
  const stats = await Global.getTotalUsersCount();
  
  if (stats) {
    res.json({ totalUsersCount: stats }); 
  } else {
    res.status(500).json({ message: 'Я не математик' });
  }
};

const getTotalAchievements = async (req, res) => {
  const stats = await Global.getTotalAchievements();
  
  if (stats) {
    res.json({ totalAchievements: stats }); 
  } else {
    res.status(500).json({ message: 'Я не математик' });
  }
};

const getTotalOnline = async (req, res) => {
  const stats = await Global.getTotalOnline();
  
  if (stats) {
    res.json({ totalOnline: stats }); 
  } else {
    res.status(500).json({ message: 'Я не математик' });
  }
};


module.exports = {
  getTotalMinutes,
  getTotalUsersCount,
  getTotalAchievements,
  getTotalOnline,
};
