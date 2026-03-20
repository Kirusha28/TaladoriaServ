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
        // 1. Получаем всех пользователей и их роли для формирования описания
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

        // Вспомогательный объект для быстрого поиска узлов по ID
        const nodesMap = {};
        // Результирующий объект в вашем формате
        const resultTree = {};

        // 2. Первый проход: создаем базовые объекты узлов
        rows?.filter((row) => !(row.parent == null)).forEach(row => {
            const userId = String(row.user_id);
            
            // Формируем описание из ролей
            const roles = [row.age_name, row.inst_name, row.fac_name].filter(Boolean);
            const description = roles.length > 0 ? roles.join(', ') : "Начинающий герой";

            nodesMap[userId] = {
                id: userId,
                name: row.nickname,
                desc: description,
                status: "unlocked",
                // status: row.status === 1 ? "unlocked" : "locked",
                shape: "circularImage",
                parent: row.parent ? String(row.parent) : null,
                children: [] // Массив для ID детей
            };
        });

        // console.log(nodesMap);

        // 3. Второй проход: связываем детей с родителями
        Object.values(nodesMap).forEach(node => {
            if (node.parent && nodesMap[node.parent]) {
                nodesMap[node.parent].children.push(node.id);
            }
        });

        // 4. Функция для расчета уровня (level) и финализации объекта
        // Level нужен для формирования пути к картинке: ./assets/owls/ID_LEVEL.png
        const calculateLevel = (nodeId, currentLevel = 1) => {
            const node = nodesMap[nodeId];
            if (!node) return;

            // Формируем финальный путь к картинке согласно вашему требованию
            node.image = `./assets/owls/${node.id}.webp`;
            // node.image = `./assets/owls/${node.id}_${currentLevel}.png`;
            node.level = currentLevel;

            // Удаляем временное поле parent, чтобы соответствовать вашему формату
            const { parent, ...finalNode } = node;
            resultTree[nodeId] = finalNode;

            // Рекурсивно обрабатываем детей, повышая уровень
            node.children.forEach(childId => calculateLevel(childId, currentLevel + 1));
        };

        // Находим корневые узлы (у которых нет родителя или родитель не найден в списке)
        // и запускаем расчет от них
        Object.values(nodesMap).forEach(node => {
            if (!node.parent || node.parent === "0" || !nodesMap[node.parent]) {
                calculateLevel(node.id, 1);
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