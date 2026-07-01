const path = require('path');
const dotenv = require('dotenv');

const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';

const result = dotenv.config({
  path: path.join(__dirname, '../../', envFile),
});

if (result.error) {
  console.warn(`[env] Не удалось загрузить ${envFile}:`, result.error.message);
} else {
  console.log(`[env] Загружен конфиг из: ${envFile}`);
}

module.exports = { envFile };
