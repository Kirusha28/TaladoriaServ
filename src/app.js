const express = require("express"); // Импортируем Express
const dotenv = require("dotenv"); // Импортируем dotenv для загрузки переменных окружения
const cors = require("cors"); // Импортируем cors для разрешения кросс-доменных запросов
const passport = require("passport"); // Импортируем Passport
const connectDB = require("./config/db"); // Импортируем функцию подключения к базе данных
const config = require("./config"); // Импортируем основные конфигурации
const { notFound, errorHandler } = require("./middleware/errorHandler"); // Импортируем обработчики ошибок

//Настройка .env
const path = require("path"); // Для работы с путями
// Определяем, какой файл загружать (по умолчанию development)
const envFile = ".env.production";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`Загружен конфиг из: ${envFile}`);
console.log(`API URL: ${process.env.FRONTEND_URL}`); // Проверка

// Модули для HTTPS
const https = require("https");
const fs = require("fs");

// Импортируем маршруты

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const globalRoutes = require("./routes/global");

// Загружаем переменные окружения
dotenv.config();

// Подключаемся к базе данных
// connectDB();
pool = require("./config/db");
async function checkDB() {
	try {
		const [rows] = await pool.query('SELECT 1');
		console.log('Database check: OK');
	} catch (err) {
		console.error('Database check: FAILED', err);
	}
}
checkDB();

const app = express(); // Создаем экземпляр приложения Express

// Промежуточное ПО
app.use(express.json()); // Включаем парсинг JSON для тела запросов
app.use(cors()); // Включаем CORS для всех маршрутов
app.use(passport.initialize()); // Инициализируем Passport

// Маршруты API
console.log("Подключаю маршруты авторизации...");
app.use("/api/auth", authRoutes); // Маршруты аутентификации
app.use("/api/users", userRoutes); // Маршруты пользователя
app.use("/api/global", globalRoutes); // Маршруты пользователя

// Маршрут по умолчанию
app.get("/api", (req, res) => {
	res.send("API работает...");
});

// Обработчики ошибок
// app.use(notFound); // Для обработки 404 Not Found
// app.use(errorHandler); // Для обработки всех остальных ошибок

// Пути к сертификатам
const privateKeyPath = path.join(__dirname, "certs", "key.pem"); // Путь к приватному ключу
const certificatePath = path.join(__dirname, "certs", "cert.pem"); // Путь к сертификату

// Проверяем существование файлов сертификатов
if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)) {
	console.error(
		"Ошибка: Файлы сертификатов (key.pem или cert.pem) не найдены в src/certs/.",
	);
	console.error(
		"Пожалуйста, сгенерируйте их с помощью mkcert и поместите в src/certs/.",
	);
	process.exit(1);
}

const sslOptions = {
	key: fs.readFileSync(privateKeyPath),
	cert: fs.readFileSync(certificatePath),
};

// Создаем HTTPS сервер
// const httpsServer = https.createServer(sslOptions, app);

// // Запускаем HTTPS сервер
// const PORT = config.port;
// httpsServer.listen(PORT, () => {
//   console.log(`HTTPS Сервер работает в режиме ${config.env} на порту ${PORT}`);
//   console.log(`Доступно по: https://localhost:${PORT}`);
// });

// Опционально: перенаправление HTTP на HTTPS
// Если вы хотите запускать и HTTP, и HTTPS
// const http = require('http');
// http.createServer((req, res) => {
//   res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//   res.end();
// }).listen(80); // Или любой другой порт для HTTP

// Запускаем сервер
const PORT = config.port;
app.listen(PORT, () => {
	console.log(`Сервер работает в режиме ${config.env} на порту ${PORT}`);
});
