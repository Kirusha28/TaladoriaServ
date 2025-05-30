const passport = require('passport'); // Импортируем Passport
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Импортируем стратегию Google OAuth
const User = require('../models/User'); // Импортируем модель пользователя
const authConfig = require('../config/auth'); // Импортируем конфигурацию аутентификации

// Настройка стратегии Google Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: authConfig.google.clientID,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Проверяем, существует ли пользователь с этим Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Если пользователь существует, возвращаем его
          return done(null, user);
        } else {
          // Если пользователь не существует, создаем нового
          // Проверяем, существует ли пользователь с таким email
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // Если пользователь с таким email существует, связываем Google ID
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // Если пользователь с таким email не существует, создаем нового пользователя
          user = new User({
            googleId: profile.id,
            username: profile.displayName || profile.emails[0].value.split('@')[0], // Используем displayName или часть email как username
            email: profile.emails[0].value,
            // Пароль не требуется для OAuth-пользователей
          });
          await user.save();
          return done(null, user);
        }
      } catch (err) {
        return done(err, false); // Обработка ошибок
      }
    }
  )
);

// Сериализация и десериализация пользователя (необходимо для Passport сессий, хотя мы используем JWT)
// Passport.js требует этого, даже если мы не используем сессии для JWT
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
