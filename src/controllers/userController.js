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
const getUserById = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    // console.log('user',user_id)
    const stats = await User.getUserById(user_id);
    
    if (stats) {
      res.json(stats); 
    } else {
      res.status(500).json({ message: 'Я не математик' });
    }
  } catch (error) {
     res.status(500).json({ message: 'Я не могу понять' });
  }
  
};
const getAllUsers = async (req, res) => {
  try {
    console.log('req.limit',parseInt(req.query.limit) || 10)
    const limit = parseInt(req.query.limit) || 10;
    // const limit = parseInt(req.query.limit) || 10;
    // console.log('user',user_id)
    const stats = await User.getAllUsers(limit);
    
    if (stats) {
      res.json(stats); 
    } else {
      res.status(500).json({ message: 'Я не математик' });
    }
  } catch (error) {
     res.status(500).json({ message: 'Я не могу понять' });
  }
  
};

module.exports = {
  getUserProfile,
  getUserById,
  getAllUsers
};
