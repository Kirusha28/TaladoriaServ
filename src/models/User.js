const bcrypt = require('bcryptjs');
// Импортируйте ваше подключение (которое мы писали ранее)
const connectDB = require('../config/db'); 

class User {
  
  // Метод для поиска пользователя по email
  static async findByUsername(username) {
    const db = await connectDB();
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findByDiscordId(user_id) {
    const db = await connectDB();
    const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [user_id]);
    return rows[0];
  }

  static async findByEmailOrUsername(email, username) {
    const db = await connectDB();
    const query = 'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1';
    const [rows] = await db.execute(query, [email, username]);
    return rows[0]; // Вернет пользователя или undefined
  }

  static async updateDiscordData(id, username) {
    const db = await connectDB();
    const query = 'UPDATE users SET username = ? WHERE user_id = ?';
    await db.execute(query, [ username, user_id]);
  }

  // Метод для связывания Discord ID с существующим email-аккаунтом
  static async linkDiscord(id, discordId) {
    const db = await connectDB();
    const query = 'UPDATE users SET discordId = ? WHERE id = ?';
    await db.execute(query, [discordId, id]);
  }

  // Аналог matchPassword
  static async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  static async getUserWithAchievements(userId) {
    // 1. Проверка входного параметра до начала работы с БД
    if (userId === undefined || userId === null) {
        console.error('[User.getUserWithAchievements] ERROR: userId is undefined or null');
        throw new Error('userId must be provided to fetch achievements');
    }

    try {
        console.log(`[User.getUserWithAchievements] Fetching data for ID: ${userId}`);
        
        const db = await connectDB();
        const query = `
            SELECT 
                u.user_id,
                u.username,
                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', a.id,
                                'name', a.name,
                                'description', a.description,
                                'imgPath', a.imgPath,
                                'creatingDate', a.creatingDate,
                                'obtained_at', ua.obtained_at,
                                'status', JSON_OBJECT(
                                    'id', ast.id,
                                    'name', ast.name,
                                    'color', ast.color,
                                    'description', ast.description
                                )
                            )
                        )
                        FROM user_achievements ua
                        JOIN achievements a ON ua.achievement_id = a.id
                        JOIN achievement_status ast ON a.statusId = ast.id
                        WHERE ua.user_id = u.user_id
                    ), 
                    JSON_ARRAY()
                ) AS achievements
            FROM users u
            WHERE u.user_id = ?
        `;

        const [rows] = await db.execute(query, [userId]);
        
        if (!rows || rows.length === 0) {
            console.warn(`[User.getUserWithAchievements] No user found with ID: ${userId}`);
            return null;
        }

        const user = rows[0];

        // 2. Логируем "сырой" ответ от БД для проверки структуры
        // console.log('[User.getUserWithAchievements] Raw user data:', user);

        // Парсинг JSON
        if (typeof user.achievements === 'string') {
            try {
                user.achievements = JSON.parse(user.achievements);
            } catch (parseError) {
                console.error('[User.getUserWithAchievements] JSON Parse Error:', parseError.message);
                // Оставляем как есть или сбрасываем в пустой массив
                user.achievements = [];
            }
        }

        return user;

    } catch (error) {
        // 3. Расширенное логирование ошибки
        console.error('--- DATABASE ERROR ---');
        console.error('Method: getUserWithAchievements');
        console.error('Target User ID:', userId);
        console.error('Message:', error.message);
        console.error('SQL State:', error.sqlState);
        console.error('Error Code:', error.code);
        console.error('----------------------');
        
        // Пробрасываем ошибку дальше, чтобы контроллер мог отправить 500 статус
        throw error;
    }
  }
}

module.exports = User;