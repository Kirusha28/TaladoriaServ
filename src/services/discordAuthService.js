const passport = require('passport'); // Импортируем Passport
const DiscordStrategy = require('passport-discord').Strategy; // Импортируем стратегию Discord OAuth
const User = require('../models/User'); // Импортируем модель пользователя
const authConfig = require('../config/auth'); // Импортируем конфигурацию аутентификации

// Настройка стратегии Discord Passport
passport.use(
  new DiscordStrategy(
    {
      clientID: authConfig.discord.clientID,
      clientSecret: authConfig.discord.clientSecret,
      callbackURL: authConfig.discord.callbackURL,
      scope: ['identify', 'email'], // Запрашиваем идентификатор и email пользователя
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Проверяем, существует ли пользователь с этим Discord ID
        let user = await User.findOne({ discordId: profile.id });

        if (user) {
          // Если пользователь существует, возвращаем его
          return done(null, user);
        } else {
          // Если пользователь не существует, создаем нового
          // Проверяем, существует ли пользователь с таким email
          user = await User.findOne({ email: profile.email });
          if (user) {
            // Если пользователь с таким email существует, связываем Discord ID
            user.discordId = profile.id;
            await user.save();
            return done(null, user);
          }

          // Если пользователь с таким email не существует, создаем нового пользователя
          user = new User({
            discordId: profile.id,
            username: profile.username, // Используем имя пользователя Discord
            email: profile.email,
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
