const User = require('../models/User'); // Импортируем модель User

// @desc    Получить профиль пользователя
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  // req.user устанавливается промежуточным ПО `protect`
  const user = await User.findById(req.user._id).select('-password'); // Исключаем пароль

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      googleId: user.googleId,
      discordId: user.discordId,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'Пользователь не найден' });
  }
};

module.exports = {
  getUserProfile,
};
