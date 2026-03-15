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
}

module.exports = User;