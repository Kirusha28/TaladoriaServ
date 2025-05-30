const request = require('supertest'); // Импортируем Supertest
const mongoose = require('mongoose'); // Импортируем Mongoose для очистки базы данных
const app = require('../../src/app'); // Импортируем наше Express-приложение
const User = require('../../src/models/User'); // Импортируем модель User
const connectDB = require('../../src/config/db'); // Импортируем функцию подключения к БД

// Подключаемся к базе данных перед запуском всех тестов
beforeAll(async () => {
  // Используем ту же базу данных, что и в app.js, но в реальном приложении лучше использовать отдельную тестовую базу данных
  await connectDB();
});

// Очищаем коллекцию пользователей после каждого теста
afterEach(async () => {
  await User.deleteMany({});
});

// Закрываем подключение к базе данных после всех тестов
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('должен зарегистрировать нового пользователя', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('должен вернуть 400, если пользователь уже существует', async () => {
      // Сначала регистрируем пользователя
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      // Пытаемся зарегистрировать того же пользователя снова
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Пользователь с таким email или именем пользователя уже существует');
    });

    it('должен вернуть 400, если отсутствуют обязательные поля', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          // Отсутствует email и password
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Пожалуйста, заполните все поля');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Регистрируем пользователя перед тестами входа
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123',
        });
    });

    it('должен войти пользователя и вернуть токен', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', 'loginuser');
      expect(res.body).toHaveProperty('email', 'login@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('должен вернуть 401 при неверном пароле', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Неверный email или пароль');
    });

    it('должен вернуть 401 при несуществующем email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Неверный email или пароль');
    });
  });

  // Тестирование маршрутов OAuth (Google/Discord) сложнее, так как они включают внешние перенаправления.
  // Обычно для них используются E2E-тесты или мокирование Passport.js на более низком уровне.
  // Здесь мы просто покажем, как можно начать тестирование этих маршрутов.
  describe('GET /api/auth/google', () => {
    it('должен перенаправить на страницу аутентификации Google', async () => {
      const res = await request(app).get('/api/auth/google');
      expect(res.statusCode).toEqual(302); // Код перенаправления
      expect(res.headers.location).toMatch(/accounts\.google\.com/); // Проверяем, что перенаправляет на Google
    });
  });

  describe('GET /api/auth/discord', () => {
    it('должен перенаправить на страницу аутентификации Discord', async () => {
      const res = await request(app).get('/api/auth/discord');
      expect(res.statusCode).toEqual(302); // Код перенаправления
      expect(res.headers.location).toMatch(/discord\.com\/oauth2\/authorize/); // Проверяем, что перенаправляет на Discord
    });
  });
});
