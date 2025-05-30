require('dotenv').config();

// Экспортируем конфигурацию для различных методов аутентификации
module.exports = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID, // ID клиента Google OAuth
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Секрет клиента Google OAuth
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // URL обратного вызова Google OAuth
  },
  discord: {
    clientID: process.env.DISCORD_CLIENT_ID, // ID клиента Discord OAuth
    clientSecret: process.env.DISCORD_CLIENT_SECRET, // Секрет клиента Discord OAuth
    callbackURL: process.env.DISCORD_CALLBACK_URL, // URL обратного вызова Discord OAuth
  },
};
