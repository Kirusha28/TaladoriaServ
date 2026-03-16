const passport = require('passport');
const HttpsProxyAgent = require('https-proxy-agent');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

// 1. Создаем агент (замени на данные своего рабочего прокси)
// Формат: http://user:password@proxy-ip:port
const proxyAgent = new HttpsProxyAgent(process.env.PROXY_URL);

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email'],
      customHeaders: { agent: proxyAgent } 
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Успешная авторизация через прокси!");
      console.log("ID пользователя Discord:", profile.id);
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