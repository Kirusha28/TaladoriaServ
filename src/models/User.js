const mongoose = require('mongoose'); // Импортируем Mongoose
const bcrypt = require('bcryptjs'); // Импортируем bcryptjs для хеширования паролей

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: function() {
      // Email обязателен, если нет Google ID или Discord ID
      return !this.googleId && !this.discordId;
    },
    unique: true,
    sparse: true, // Позволяет иметь несколько документов с null для email
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      // Пароль обязателен, если нет Google ID или Discord ID
      return !this.googleId && !this.discordId;
    },
    minlength: [6, 'Пароль должен быть не менее 6 символов'],
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Позволяет иметь несколько документов с null для googleId
  },
  discordId: {
    type: String,
    unique: true,
    sparse: true, // Позволяет иметь несколько документов с null для discordId
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Предварительная обработка перед сохранением: хеширование пароля
UserSchema.pre('save', async function (next) {
  // Если пароль не был изменен или это не новый пользователь, пропускаем хеширование
  if (!this.isModified('password')) {
    return next();
  }
  // Генерируем соль
  const salt = await bcrypt.genSalt(10);
  // Хешируем пароль с солью
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для сравнения введенного пароля с хешированным паролем в базе данных
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); // Экспортируем модель User
