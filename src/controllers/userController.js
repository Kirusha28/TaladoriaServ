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
    // Получаем ID пользователя которого нужно найти из query параметра
    const targetUserId = req.query.user_id;
    
    // Проверяем что ID был передан в запросе
    if (!targetUserId) {
      return res.status(400).json({ message: 'Не указан user_id параметр в запросе' });
    }

    const userData = await User.getUserById(targetUserId);
    
    if (userData) {
      res.json(userData); 
    } else {
      res.status(404).json({ message: 'Пользователь с таким ID не найден' });
    }
  } catch (error) {
     console.error('Ошибка при получении пользователя по ID:', error);
     res.status(500).json({ message: 'Ошибка сервера при получении данных пользователя' });
  }
  
};
const getUserByIdOrUsername = async (req, res) => {
  try {
    // Получаем ID пользователя которого нужно найти из query параметра
    const targetUser = req.query.user;
    
    // Проверяем что ID был передан в запросе
    if (!targetUser) {
      return res.status(400).json({ message: 'Не указан user_id параметр в запросе' });
    }

    const userData = await User.getUserByIdOrUsername(targetUser);
    
    if (userData) {
      res.json(userData); 
    } else {
      res.status(404).json({ message: 'Пользователь с таким ID не найден' });
    }
  } catch (error) {
     console.error('Ошибка при получении пользователя по ID:', error);
     res.status(500).json({ message: 'Ошибка сервера при получении данных пользователя' });
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
  getUserByIdOrUsername,
  getAllUsers
};
