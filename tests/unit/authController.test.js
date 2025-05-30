const { registerUser, loginUser } = require('../../src/controllers/authController');
const User = require('../../src/models/User');
const generateToken = require('../../src/utils/jwt');

// Мокируем модель User и функцию generateToken
jest.mock('../../src/models/User');
jest.mock('../../src/utils/jwt');

describe('authController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Сброс моков перед каждым тестом
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(), // Позволяет чейнинг .status().json()
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищаем все моки после каждого теста
  });

  describe('registerUser', () => {
    it('должен зарегистрировать пользователя и вернуть токен при успешной регистрации', async () => {
      mockReq.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Мокируем User.findOne, чтобы он вернул null (пользователь не существует)
      User.findOne.mockResolvedValue(null);
      // Мокируем User.create, чтобы он вернул нового пользователя
      User.create.mockResolvedValue({
        _id: 'someUserId',
        username: 'testuser',
        email: 'test@example.com',
      });
      // Мокируем generateToken
      generateToken.mockReturnValue('mockedToken');

      await registerUser(mockReq, mockRes);

      // Проверяем, что User.findOne был вызван с правильными аргументами
      expect(User.findOne).toHaveBeenCalledWith({ $or: [{ email: 'test@example.com' }, { username: 'testuser' }] });
      // Проверяем, что User.create был вызван с правильными аргументами
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      // Проверяем, что статус ответа 201
      expect(mockRes.status).toHaveBeenCalledWith(201);
      // Проверяем, что JSON-ответ содержит правильные данные
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'someUserId',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mockedToken',
      });
    });

    it('должен вернуть 400, если пользователь с таким email или именем пользователя уже существует', async () => {
      mockReq.body = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Мокируем User.findOne, чтобы он вернул существующего пользователя
      User.findOne.mockResolvedValue({
        _id: 'existingUserId',
        username: 'existinguser',
        email: 'existing@example.com',
      });

      await registerUser(mockReq, mockRes);

      // Проверяем, что статус ответа 400
      expect(mockRes.status).toHaveBeenCalledWith(400);
      // Проверяем, что JSON-ответ содержит сообщение об ошибке
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Пользователь с таким email или именем пользователя уже существует' });
      // Проверяем, что User.create не был вызван
      expect(User.create).not.toHaveBeenCalled();
    });

    it('должен вернуть 400, если отсутствуют обязательные поля', async () => {
      mockReq.body = {
        username: 'testuser',
        // Отсутствует email и password
      };

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Пожалуйста, заполните все поля' });
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('должен вернуть токен при успешном входе', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: 'someUserId',
        username: 'testuser',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(true), // Мокируем метод matchPassword
      };

      User.findOne.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mockedToken');

      await loginUser(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'someUserId',
        username: 'testuser',
        email: 'test@example.com',
        token: 'mockedToken',
      });
    });

    it('должен вернуть 401 при неверном email или пароле', async () => {
      mockReq.body = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      User.findOne.mockResolvedValue(null); // Пользователь не найден

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Неверный email или пароль' });
    });

    it('должен вернуть 401 при неверном пароле для существующего пользователя', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: 'someUserId',
        username: 'testuser',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false), // Пароль не совпадает
      };

      User.findOne.mockResolvedValue(mockUser);

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Неверный email или пароль' });
    });
  });
});
