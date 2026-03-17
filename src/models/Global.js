const connectDB = require('../config/db'); 
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

}

module.exports = Global;