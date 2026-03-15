const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Сначала ищем по Discord ID
        let user = await User.findByDiscordId(profile.id);

        if (user) {
          return done(null, user);
        }


        // 3. ЕСЛИ ЮЗЕРА НЕТ В БАЗЕ (Ни по ID, ни по Email)
        // Вместо User.create возвращаем false и сообщение
        return done(null, false, { message: 'User not found' });

      } catch (err) {
        console.error('Ошибка в DiscordStrategy:', err);
        return done(err, false);
      }
    }
  )
);