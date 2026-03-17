const bcrypt = require("bcryptjs");
// Импортируйте ваше подключение (которое мы писали ранее)
// const connectDB = require("../config/db");
const db = require("../config/db");

class User {
	static async updateDiscordData(id, username) {
    try {
      // const db = await connectDB();
      const query = "UPDATE users SET username = ? WHERE user_id = ?";
      await db.execute(query, [username, user_id]);
    } catch (error) {
      console.error(error);
    }
	}

	// Метод для связывания Discord ID с существующим email-аккаунтом
	static async linkDiscord(id, discordId) {
    try {
      // const db = await connectDB();
      const query = "UPDATE users SET discordId = ? WHERE id = ?";
      await db.execute(query, [discordId, id]);
    } catch (error) {
      console.error(error);
    }
	}

	// Аналог matchPassword
	static async matchPassword(enteredPassword, hashedPassword) {
		return await bcrypt.compare(enteredPassword, hashedPassword);
	}

	static async getUserById(userId) {
		// 1. Проверка входного параметра до начала работы с БД
		if (userId === undefined || userId === null) {
			console.error(
				"[User.getUserWithAchievements] ERROR: userId is undefined or null",
			);
			throw new Error("userId must be provided to fetch achievements");
		}

		try {
			// console.log(
			// 	`[User.getUserWithAchievements] Fetching data for ID: ${userId}`,
			// );

			// const db = await connectDB();

			// Обрати внимание: я заменил u.username на u.nickname,
			// так как на твоем скриншоте таблицы users колонка называется именно nickname.
			const query = `
            SELECT 
                u.user_id,
                u.nickname,
                u.username,
                u.avatar,
                u.level,
                u.status,
                u.total_voice_minutes,
                u.message_count,
                u.register_date,
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
                ) AS achievements,
                
                -- Собираем роль возраста
                IF(r_age.id IS NOT NULL, JSON_OBJECT(
                    'id', r_age.id, 
                    'name', r_age.name, 
                    'description', r_age.description, 
                    'priority', r_age.priority,
                    'role_id', r_age.role_id
                ), NULL) AS role_age_data,
                
                -- Собираем роль института
                IF(r_inst.id IS NOT NULL, JSON_OBJECT(
                    'id', r_inst.id, 
                    'name', r_inst.name, 
                    'description', r_inst.description, 
                    'priority', r_inst.priority,
                    'role_id', r_inst.role_id
                ), NULL) AS role_institute_data,
                
                -- Собираем роль факультета
                IF(r_fac.id IS NOT NULL, JSON_OBJECT(
                    'id', r_fac.id, 
                    'name', r_fac.name, 
                    'description', r_fac.description, 
                    'priority', r_fac.priority,
                    'role_id', r_fac.role_id
                ), NULL) AS role_faculty_data
                
            FROM users u
            LEFT JOIN roles r_age ON u.role_age = r_age.role_id AND r_age.type = 'role_age'
            LEFT JOIN roles r_inst ON u.role_institute = r_inst.role_id AND r_inst.type = 'role_institute'
            LEFT JOIN roles r_fac ON u.role_faculty = r_fac.role_id AND r_fac.type = 'role_faculty'
            WHERE u.user_id = ?
        `;

			const [rows] = await db.execute(query, [userId]);

			if (!rows || rows.length === 0) {
				console.warn(
					`[User.getUserWithAchievements] No user found with ID: ${userId}`,
				);
				return null;
			}

			const user = rows[0];

			if (typeof user.achievements === "string") {
				try {
					user.achievements = JSON.parse(user.achievements);
				} catch (parseError) {
					console.error(
						"[User.getUserWithAchievements] JSON Parse Error (achievements):",
						parseError.message,
					);
					user.achievements = [];
				}
			}

			const roleFields = [
				"role_age_data",
				"role_institute_data",
				"role_faculty_data",
			];
			for (const field of roleFields) {
				if (typeof user[field] === "string") {
					try {
						user[field] = JSON.parse(user[field]);
					} catch (e) {
						console.error(
							`[User.getUserWithAchievements] JSON Parse Error (${field}):`,
							e.message,
						);
						user[field] = null;
					}
				}
			}

			return user;
		} catch (error) {
			// Расширенное логирование ошибки
			console.error("--- DATABASE ERROR ---");
			console.error("Method: getUserWithAchievements");
			console.error("Target User ID:", userId);
			console.error("Message:", error.message);
			console.error("SQL State:", error.sqlState);
			console.error("Error Code:", error.code);
			console.error("----------------------");

			throw error;
		}
	}

  static async getAllUsers(limit = 10) {
    try {
        const parsedLimit = parseInt(limit, 10);
        const safeLimit = isNaN(parsedLimit) ? 10 : parsedLimit;

        console.log(`[User.getAllUsers] Fetching top ${safeLimit} users...`);

        // const db = await connectDB();
        
        // 1. Получаем общее количество (полезно для пагинации на фронте)
        const [countRows] = await db.query('SELECT COUNT(*) as total FROM users');
        const totalCount = countRows[0].total;

        // 2. Основной запрос с лимитом
        const query = `
            SELECT 
                u.user_id,
                u.avatar,
                u.nickname,
                u.status,
                u.total_voice_minutes,
                u.register_date,
                
                IF(r_age.id IS NOT NULL, JSON_OBJECT(
                    'id', r_age.id, 
                    'name', r_age.name, 
                    'description', r_age.description, 
                    'priority', r_age.priority,
                    'role_id', r_age.role_id
                ), NULL) AS role_age,
                
                IF(r_inst.id IS NOT NULL, JSON_OBJECT(
                    'id', r_inst.id, 
                    'name', r_inst.name, 
                    'description', r_inst.description, 
                    'priority', r_inst.priority,
                    'role_id', r_inst.role_id
                ), NULL) AS role_institute,
                
                IF(r_fac.id IS NOT NULL, JSON_OBJECT(
                    'id', r_fac.id, 
                    'name', r_fac.name, 
                    'description', r_fac.description, 
                    'priority', r_fac.priority,
                    'role_id', r_fac.role_id
                ), NULL) AS role_faculty
                
            FROM users u
            LEFT JOIN roles r_age ON u.role_age = r_age.role_id AND r_age.type = 'role_age'
            LEFT JOIN roles r_inst ON u.role_institute = r_inst.role_id AND r_inst.type = 'role_institute'
            LEFT JOIN roles r_fac ON u.role_faculty = r_fac.role_id AND r_fac.type = 'role_faculty'
            ORDER BY u.total_voice_minutes DESC
            LIMIT ?
        `;

        // Передаем limit как число
        const [rows] = await db.query(query, [safeLimit]);
        
        if (!rows || rows.length === 0) {
            return { total: totalCount, users: [] };
        }

        const roleFields = ['role_age', 'role_institute', 'role_faculty'];
        
        const users = rows.map(user => {
            roleFields.forEach(field => {
                if (typeof user[field] === 'string') {
                    try {
                        user[field] = JSON.parse(user[field]);
                    } catch (e) {
                        user[field] = null;
                    }
                }
            });
            return user;
        });

        // Возвращаем объект с данными и счетчиком
        return {
            total: totalCount,
            users: users
        };

    } catch (error) {
        console.error('--- DATABASE ERROR ---', error.message);
        throw error;
    }
  }
}

module.exports = User;
