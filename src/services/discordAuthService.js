require('../config/env');

const passport = require('passport');
const { SocksProxyAgent } = require('socks-proxy-agent');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_CALLBACK_URL,
  PROXY_URL,
  DEV_MODE,
} = process.env;

const isDevMode = DEV_MODE === 'true';

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_CALLBACK_URL) {
  console.error('[DiscordAuth] Не заданы переменные окружения:', {
    DISCORD_CLIENT_ID: !!DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: !!DISCORD_CLIENT_SECRET,
    DISCORD_CALLBACK_URL: !!DISCORD_CALLBACK_URL,
  });
}

const proxyAgent = PROXY_URL ? new SocksProxyAgent(PROXY_URL) : null;

const discordStrategy = new DiscordStrategy(
    {
      clientID: DISCORD_CLIENT_ID,
      clientSecret: DISCORD_CLIENT_SECRET,
      callbackURL: DISCORD_CALLBACK_URL,
      scope: ['identify', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Успешная авторизация через прокси!");
      console.log("ID пользователя Discord:", profile.id);
      try {
        // 1. Сначала ищем по Discord ID
        let user = await User.getUserById(profile.id);

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

if (discordStrategy._oauth2 && discordStrategy._oauth2.setAgent && !isDevMode && proxyAgent) {
    discordStrategy._oauth2.setAgent(proxyAgent);
    console.log('[DiscordAuth] Прокси установлен:', PROXY_URL);
} else if (!isDevMode && !proxyAgent) {
    console.warn('[DiscordAuth] PROXY_URL не задан, запросы к Discord идут напрямую');
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