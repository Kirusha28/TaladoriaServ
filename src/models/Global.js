const db = require("../config/db");

class Global {
  
  // Метод для получения всего времени в голосовых каналах
  static async getTotalMinutes() {
    try {
      // const db = await connectDB();

      const [rows] = await db.execute('SELECT SUM(total_voice_minutes) AS total FROM users');
      
      return rows[0].total || 0; 
    } catch (error) {
      console.error('Ошибка при расчете суммарного времени:', error);
      throw error;
    }
  }

  static async getTotalUsersCount() {
    try {
      // const db = await connectDB();

      const [rows] = await db.execute('SELECT COUNT(*) AS total FROM users');
      
      return rows[0].total || 0; 
    } catch (error) {
      console.error('Ошибка при расчете суммарного времени:', error);
      throw error;
    }
  }

  static async getTotalAchievements() {
    try {
      // const db = await connectDB();

      const [rows] = await db.execute('SELECT COUNT(*) AS total FROM achievements');
      
      return rows[0].total || 0;  
    } catch (error) {
      console.error('Ошибка при расчете суммарного времени:', error);
      throw error;
    }
  }

  static async getAllAchievements() {
    try {
      const query = `
        SELECT 
          a.id,
          a.name,
          a.description,
          a.imgPath,
          a.creatingDate,
          IF(s.id IS NOT NULL, JSON_OBJECT(
              'id', s.id,
              'name', s.name,
              'color', s.color,
              'description', s.description
          ), NULL) AS status,
          COUNT(DISTINCT ua.user_id) AS usersCount
        FROM achievements a
        LEFT JOIN achievement_status s ON a.statusId = s.id
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
        GROUP BY a.id, a.name, a.description, a.imgPath, a.creatingDate, s.id, s.name, s.color, s.description
        ORDER BY a.creatingDate DESC
      `;

      const [rows] = await db.execute(query);

      const achievements = rows.map(row => {
        if (typeof row.status === 'string') {
          try {
            row.status = JSON.parse(row.status);
          } catch (e) {
            row.status = null;
          }
        }
        // Приводим к числу на случай если база вернет строку
        row.usersCount = Number(row.usersCount) || 0;
        return row;
      });

      return achievements;
    } catch (error) {
      console.error('Ошибка при получении всех достижений:', error);
      throw error;
    }
  }

  static async getTotalOnline() {
    try {
      // const db = await connectDB();

      const [rows] = await db.execute('SELECT SUM(status) AS total FROM users');
      
      return rows[0].total || 0;  
    } catch (error) {
      console.error('Ошибка при расчете суммарного времени:', error);
      throw error;
    }
  }

  static async getTreeData() {
    try {
        const query = `
            SELECT 
                u.user_id,
                u.nickname,
                u.status,
                u.parent,
                r_age.name AS age_name,
                r_inst.name AS inst_name,
                r_fac.name AS fac_name
            FROM users u
            LEFT JOIN roles r_age ON u.role_age = r_age.role_id AND r_age.type = 'role_age'
            LEFT JOIN roles r_inst ON u.role_institute = r_inst.role_id AND r_inst.type = 'role_institute'
            LEFT JOIN roles r_fac ON u.role_faculty = r_fac.role_id AND r_fac.type = 'role_faculty'
        `;

        const [rows] = await db.query(query);

        const nodesMap = {};
        const resultTree = {};

        // 1. Первый проход: Создаем карту узлов
        rows?.filter((row) => row.parent != null).forEach(row => {
            const userId = String(row.user_id);
            // Приводим parent к строке и убираем лишние пробелы для корректного парсинга
            const rawParent = String(row.parent).trim();
            
            let parsedParentId = null;
            let parsedStartLevel = null;

            // Логика разбора значения parent
            if (rawParent.includes(',')) {
                // Формат "parentId,level" (например, "381574598770163723,2")
                const parts = rawParent.split(',');
                parsedParentId = parts[0].trim();
                parsedStartLevel = Number(parts[1].trim());
            } else {
                // Формат "число" (либо ID, либо уровень)
                const numValue = Number(rawParent);
                if (!isNaN(numValue)) {
                    if (numValue < 99) {
                        parsedStartLevel = numValue; // Это уровень
                    } else {
                        parsedParentId = rawParent; // Это ID родителя
                    }
                }
            }

            const roles = [row.age_name, row.inst_name, row.fac_name].filter(Boolean);
            const description = roles.length > 0 ? roles.join(', ') : "Начинающий герой";

            nodesMap[userId] = {
                id: userId,
                name: row.nickname,
                desc: description,
                status: "unlocked",
                shape: "circularImage",
                parentId: parsedParentId,
                startLevel: parsedStartLevel,
                children: []
            };
        });

        // 2. Второй проход: Связываем детей с реальными родителями
        Object.values(nodesMap).forEach(node => {
            if (node.parentId && nodesMap[node.parentId]) {
                nodesMap[node.parentId].children.push(node.id);
            }
        });

        // 3. Рекурсивная функция для расчета уровня и путей
        const finalizeNode = (nodeId, currentLevel) => {
            const node = nodesMap[nodeId];
            if (!node) return;

            // Если у узла явно задан уровень (например, через запятую или как корень),
            // он в приоритете над уровнем, который передает родитель
            const actualLevel = node.startLevel !== null ? node.startLevel : currentLevel;

            node.level = actualLevel;
            node.image = `./assets/owls/${node.id}.webp`;

            // Убираем технические поля перед добавлением в финальное дерево
            const { parentId, startLevel, ...finalNodeData } = node;
            resultTree[nodeId] = finalNodeData;

            // Рекурсия для детей. Уровень детей будет +1 от текущего (actualLevel)
            node.children.forEach(childId => finalizeNode(childId, actualLevel + 1));
        };

        // 4. Запуск обработки
        Object.values(nodesMap).forEach(node => {
            // Узел считается корневым (точкой входа), если:
            // - У него нет родителя
            // - Или его реальный родитель почему-то отсутствует в базе
            if (!node.parentId || !nodesMap[node.parentId]) {
                const levelToStart = node.startLevel !== null ? node.startLevel : 1;
                finalizeNode(node.id, levelToStart);
            }
        });

        return resultTree;

    } catch (error) {
        console.error('Ошибка при генерации дерева:', error);
        throw error;
    }
  }

}

module.exports = Global;