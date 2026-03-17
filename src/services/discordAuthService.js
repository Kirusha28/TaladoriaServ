const passport = require('passport');
const { SocksProxyAgent } = require('socks-proxy-agent');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

// 1. Создаем агент (замени на данные своего рабочего прокси)
// Формат: http://user:password@proxy-ip:port
const proxyAgent = new SocksProxyAgent(process.env.PROXY_URL);

const discordStrategy = new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ['identify', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Успешная авторизация через прокси!");
      console.log("ID пользователя Discord:", profile.id);
      try {
        // 1. Сначала ищем по Discord ID
        let user = await User.getUserById(profile.user_id);

        if (user) {
            console.log(`[DiscordAuth] Пользователь найден: ${user.nickname || user.username}`);
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

if (discordStrategy._oauth2 && discordStrategy._oauth2.setAgent && !process.env.FRONTEND_URL) {
    discordStrategy._oauth2.setAgent(proxyAgent);
}

// 4. И только теперь регистрируем стратегию в паспорт
passport.use(discordStrategy);

// 2. Сериализация (необходима для работы сессий)
// Сохраняем только ID пользователя в сессию
passport.serializeUser((user, done) => {done(null, user.user_id || user.id);})

// Получаем пользователя из базы при каждом запросе, используя ID из сессии
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;