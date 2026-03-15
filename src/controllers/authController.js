const User = require('../models/User'); // Ваша новая модель на MySQL
const generateToken = require('../utils/jwt');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// @desc    Получить данные профиля текущего пользователя
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Если мидлвар отработал криво и req.user пустой
    if (!req.user) {
      return res.status(401).json({ message: 'Данные пользователя не загружены' });
    }

    const user = req.user;

    // Проверяем наличие полей (в MySQL они могут называться иначе, например user_id)
    res.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      discordId: user.discordId,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Ошибка в getMe:', error);
    res.status(500).json({ message: 'Внутренняя ошибка сервера при получении профиля' });
  }
};

// @desc    Аутентификация пользователя и получение токена
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Проверяем, что email и пароль предоставлены
    if (!email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, введите email и пароль' });
    }

    // Находим пользователя по email
    const user = await User.findOne({ email });

    // Проверяем, существует ли пользователь и совпадает ли пароль
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user.user_id), // Генерируем JWT
      });
    } else {
      res.status(401).json({ message: 'Неверный email или пароль' });
    }
  } catch (error) {
    next(error); // Передаем ошибку обработчику ошибок
  }
};

// @desc    Discord Callback
const discordCallback = (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    if (err) return next(err);

    // Если стратегия вернула false (пользователь не найден)
    if (!user) {
      return res.status(404).json({ 
        message: info && info.message === 'User not found' 
          ? 'Пользователь не найден в системе. Пожалуйста, зарегистрируйтесь.' 
          : 'Ошибка авторизации' 
      });
    }

    // Если всё ок, логиним пользователя
    req.logIn(user, (err) => {
      if (err) return next(err);
      
      const token = generateToken(user.user_id);
      res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    });
  })(req, res, next);
};

module.exports = {
  loginUser,
  discordCallback,
  getMe,
};