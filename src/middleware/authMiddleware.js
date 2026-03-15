const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtConfig = require('../config/jwt');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 1. Декодируем токен
            const decoded = jwt.verify(token, jwtConfig.secret);
            
            // Проверяем, что именно лежит в токене (id или user_id)
            // console.log('decoded:', decoded);
            const userId = decoded.user_id;
            // console.log('userId:', userId);
            if (!userId) {
              console.error('ID не найден в полезной нагрузке токена:', decoded);
              return res.status(401).json({ message: 'Неверная структура токена' });
            }
            // 2. Ищем пользователя
            const userResult = await User.findByDiscordId(userId);

            // 3. MySQL возвращает данные по-разному в зависимости от драйвера.
            // Если это массив строк, берем первую. Если объект — берем его.
            const user = Array.isArray(userResult) ? userResult[0] : userResult;

            if (!user) {
                return res.status(401).json({ message: 'Несанкционированный доступ, пользователь не найден в БД' });
            }

            // 4. ПРИКРЕПЛЯЕМ К ЗАПРОСУ
            // Убеждаемся, что мы не передаем пароль (если он есть)
            const { password, ...userWithoutPassword } = user;
            req.user = userWithoutPassword;

            return next(); // Обязательно выходим из мидлвара через return
            
        } catch (error) {
            console.error('JWT Error:', error.message);
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Срок действия токена истек' });
            }
            return res.status(401).json({ message: 'Неверный токен' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Токен отсутствует' });
    }
};

module.exports = { protect };