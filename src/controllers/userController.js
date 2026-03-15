const User = require('../models/User'); // Импортируем модель User

// @desc    Получить профиль пользователя
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // Мидлвар protect уже нашел пользователя и положил его в req.user
  const user = req.user; 

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Пользователь не найден' });
  }
};

module.exports = {
  getUserProfile,
};
