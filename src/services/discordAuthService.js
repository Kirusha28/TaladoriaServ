const passport = require('passport'); // Импортируем Passport
const DiscordStrategy = require('passport-discord').Strategy; // Импортируем стратегию Discord OAuth
const User = require('../models/User'); // Импортируем модель пользователя

// Настройка стратегии Discord Passport
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID, // ID клиента Discord OAuth из .env
      clientSecret: process.env.DISCORD_CLIENT_SECRET, // Секрет клиента Discord OAuth из .env
      callbackURL: process.env.DISCORD_CALLBACK_URL, // URL обратного вызова Discord OAuth из .env
      scope: ['identify', 'email'], // Запрашиваем идентификатор и email пользователя
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ discordId: profile.id });

        if (user) {
          // Если пользователь существует, обновить его данные (например, email или username)
          user.email = profile.email || user.email;
          user.username = profile.username || user.username;
          await user.save();
          return done(null, user);
        } else {
          // Если пользователь не существует, создать нового
          // Проверяем, существует ли пользователь с таким email (для связывания аккаунтов)
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
        console.error('Ошибка в DiscordStrategy:', err); // Логируем ошибку
        return done(err, false); // Обработка ошибок
      }
    }
  )
);

// Сериализация и десериализация пользователя (необходимо для Passport, даже если мы используем JWT)
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
