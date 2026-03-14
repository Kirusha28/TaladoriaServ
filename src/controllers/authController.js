const User = require('../models/User'); // Импортируем модель User
const generateToken = require('../utils/jwt'); // Импортируем утилиту для генерации токенов

// Получаем URL фронтенда из переменных окружения
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Убедитесь, что порт соответствует вашему React-приложению!

// @desc    Регистрация нового пользователя
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Проверяем, что все обязательные поля заполнены
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Проверяем, существует ли пользователь с таким email или username
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'Пользователь с таким email или именем пользователя уже существует' });
    }

    // Создаем нового пользователя
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id), // Генерируем JWT
      });
    } else {
      res.status(400).json({ message: 'Неверные данные пользователя' });
    }
  } catch (error) {
    next(error); // Передаем ошибку обработчику ошибок
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
        token: generateToken(user._id), // Генерируем JWT
      });
    } else {
      res.status(401).json({ message: 'Неверный email или пароль' });
    }
  } catch (error) {
    next(error); // Передаем ошибку обработчику ошибок
  }
};


// @desc    Обработка обратного вызова Discord OAuth
// @route   GET /api/auth/discord/callback
// @access  Public (обрабатывается Passport.js)
const discordCallback = async (req, res) => {
  if (req.user) {
    // Перенаправляем на главную страницу React-приложения, передавая токен в параметре URL
    res.redirect(`${FRONTEND_URL}?token=${generateToken(req.user._id)}`);
  } else {
    // В случае ошибки перенаправляем на фронтенд с индикатором ошибки
    res.redirect(`${FRONTEND_URL}?auth_error=true`);
  }
};

module.exports = {
  registerUser,
  loginUser,
  discordCallback,
};
