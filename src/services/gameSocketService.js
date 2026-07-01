// Константы физики и размеров
const BIRD_WIDTH = 34;
const BIRD_HEIGHT = 24;
const PIPE_WIDTH = 50;
const CANVAS_HEIGHT = 500;
const PIPE_SPEED = 5;
const SPAWN_RATE = 1500; // мс между трубами
const MAX_LIVES = 3;
const INVULNERABILITY_TIME = 2000; // 2 секунды мигания после получения урона
const START_DELAY = 3000; // 3 секунды отсчета

// Классы сов из Таладории
const OWL_CLASSES = {
	barn: {
		name: "Сипуха",
		gravity: 0.3,
		jump: -7,
		desc: "Легкая и маневренная",
	},
	horned: {
		name: "Филин",
		gravity: 0.7,
		jump: -9,
		desc: "Тяжелый, мощный рывок",
	},
	scops: { name: "Сыч", gravity: 0.6, jump: -7.5, desc: "Баланс мудрости" },
};

module.exports = function (io) {
	// Хранилище комнат: roomId -> { players: {}, pipes: [], intervalIds: [] }
	const rooms = {};

	// Функция проверки столкновений
	const checkCollision = (player, pipes) => {
		// Если игрок во временной неуязвимости после удара или призрак — игнорируем
		if (player.isGhost || player.invulnerable) return false;

		if (player.y < 0 || player.y + BIRD_HEIGHT > CANVAS_HEIGHT) return true;

		for (let pipe of pipes) {
			const withinX = 50 + BIRD_WIDTH > pipe.x && 50 < pipe.x + PIPE_WIDTH;
			const hitTop = player.y < pipe.topHeight;
			const hitBottom = player.y + BIRD_HEIGHT > pipe.topHeight + pipe.gap;
			if (withinX && (hitTop || hitBottom)) return true;
		}
		return false;
	};

	io.on("connection", (socket) => {
		console.log(`Игрок подключился: ${socket.id}`);

		// 1. Игрок присоединяется к комнате и выбирает сову
		socket.on("joinGameRoom", ({ roomId, owlType, userId }) => {
			// 1. Присоединяем сокет к комнате
			socket.join(roomId);
			socket.roomId = roomId;

			// 2. Создаем объект комнаты, если его еще нет
			if (!rooms[roomId]) {
				rooms[roomId] = {
					players: {},
					pipes: [],
					pipeIdCounter: 0,
					gameActive: false,
					status: "LOBBY",
				};
			}

			// ИСПРАВЛЕНИЕ #2: Если owlType нет, игрок просто зашел на страницу (в лобби)
			if (!owlType) {
				// ИСПРАВЛЕНИЕ #1: Отправляем ТОЛЬКО чистые данные, без интервалов
				socket.emit("gameState", {
					players: rooms[roomId].players,
					pipes: rooms[roomId].pipes,
					status: rooms[roomId].status,
				});
				return; // ПРЕРЫВАЕМ ФУНКЦИЮ! Не создаем игрока и не запускаем игру.
			}

			// 3. Если мы дошли сюда, значит игрок выбрал сову и нажал играть
			rooms[roomId].players[socket.id] = {
				id: socket.id,
				userId,
				owlType,
				y: 250,
				velocity: 0,
				score: 0,
				lives: MAX_LIVES,
				alive: true,
				invulnerable: false,
				isGhost: false,
				isReady: false, // НОВОЕ ПОЛЕ
				physics: OWL_CLASSES[owlType] || OWL_CLASSES["scops"],
			};

			// 4. Запуск раунда или отправка текущего состояния
			if (!rooms[roomId].gameActive && rooms[roomId].status === "LOBBY") {
				io.to(roomId).emit("gameState", {
					players: rooms[roomId].players,
					pipes: rooms[roomId].pipes,
					status: rooms[roomId].status,
				});
			} else {
				// ИСПРАВЛЕНИЕ #1: Опять же, отправляем только безопасные данные
				socket.emit("gameState", {
					players: rooms[roomId].players,
					pipes: rooms[roomId].pipes,
					status: rooms[roomId].status,
				});
			}
		});

		// 2. Обработка прыжка
		socket.on("jump", () => {
			const roomId = socket.roomId; // Берем сохраненный ID комнаты из сокета
			const room = rooms[roomId];

			if (!room || room.status !== "PLAYING") return;

			const player = room.players[socket.id]; // Ищем игрока именно по ID текущего сокета

			if (player && player.alive) {
				// Вместо += используем прямое присваивание, чтобы рывок был четким
				// и не зависел от того, падает ли птица в этот момент или уже летит вверх
				player.velocity = player.physics.jump;
			}
		});

		// 3. Спец-способность: Призрак (Неуязвимость)
		socket.on("activateGhost", () => {
			const player = rooms[socket.roomId]?.players[socket.id];
			if (player && player.alive) player.isGhost = true;
		});

		socket.on("deactivateGhost", () => {
			const player = rooms[socket.roomId]?.players[socket.id];
			if (player && player.alive) player.isGhost = false;
		});

		// 4. Отключение игрока
		socket.on("disconnect", () => {
			const roomId = socket.roomId;
			if (roomId && rooms[roomId]) {
				delete rooms[roomId].players[socket.id];
				// Если в комнате никого не осталось, очищаем её
				if (Object.keys(rooms[roomId].players).length === 0) {
					clearInterval(rooms[roomId].physicsInterval);
					clearInterval(rooms[roomId].pipeInterval);
					delete rooms[roomId];
				}
			}
		});

		socket.on("toggleReady", () => {
			const room = rooms[socket.roomId];
			if (!room) return;
			const player = room.players[socket.id];

			if (player && room.status === "LOBBY") {
				player.isReady = !player.isReady; // Переключаем статус

				// Получаем всех игроков в комнате
				const players = Object.values(room.players);

				// Проверяем, все ли готовы (и есть ли вообще игроки)
				const allReady = players.length > 0 && players.every((p) => p.isReady);

				// Рассылаем обновленные статусы (чтобы на фронте показать галочки)
				io.to(socket.roomId).emit("gameState", {
					players: room.players,
					pipes: room.pipes,
					status: room.status,
				});

				// Если все готовы — запускаем отсчет!
				if (allReady) {
					prepareNewRound(socket.roomId);
				}
			}
		});
	});

	function prepareNewRound(roomId) {
		const room = rooms[roomId];
		if (!room) return;

		room.gameActive = true;
		room.pipes = [];
		room.status = "COUNTDOWN";

		// Вычисляем время, когда игра реально начнется
		const startTime = Date.now() + START_DELAY;

		// Сбрасываем позиции игроков
		Object.values(room.players).forEach((p) => {
			p.y = 250;
			p.velocity = 0;
			p.alive = true;
			p.lives = MAX_LIVES;
			p.invulnerable = false;
		});

		// Отправляем событие с точным временем старта
		io.to(roomId).emit("countdownStarted", {
			startTime,
			duration: START_DELAY,
		});

		// Через 3 секунды запускаем трубы
		setTimeout(() => {
			room.status = "PLAYING";
			// Очищаем старые интервалы перед запуском новых, чтобы не было "двоения"
			clearInterval(room.pipeInterval);
			clearInterval(room.physicsInterval);
			startGameLoops(roomId);
		}, START_DELAY);
	}

	// Запуск игровых циклов для конкретной комнаты
	function startGameLoops(roomId) {
		const room = rooms[roomId];
		if (!room) return;

		clearInterval(room.pipeInterval);
		clearInterval(room.physicsInterval);

		// 1. Создание труб
		room.pipeInterval = setInterval(() => {
			if (room.status !== "PLAYING") return;

			const pipe = {
				id: room.pipeIdCounter++,
				x: 800,
				topHeight: Math.random() * (300 - 100) + 50,
				gap: 150,
				passedBy: [],
			};
			room.pipes.push(pipe);
		}, SPAWN_RATE);

		// 2. Цикл физики (60 раз в секунду)
		room.physicsInterval = setInterval(() => {
			if (room.status !== "PLAYING") return;

			// ДВИЖЕНИЕ ТРУБ (Вот эта строка была пропущена!)
			room.pipes = room.pipes
				.map((p) => ({ ...p, x: p.x - PIPE_SPEED }))
				.filter((p) => p.x > -100); // Удаляем трубы, улетевшие за экран

			const players = Object.values(room.players);
			players.forEach((player) => {
				if (!player.alive) return;

				// Физика птицы
				player.velocity += player.physics.gravity;
				if (player.velocity > 10) player.velocity = 10;
				player.y += player.velocity;

				// Границы экрана
				if (player.y < 0) {
					player.y = 0;
					player.velocity = 0;
				}
				if (player.y + BIRD_HEIGHT > CANVAS_HEIGHT) {
					handleHit(player, roomId); // Упал — получил урон
				}

				// Проверка пролета трубы (очки)
				room.pipes.forEach((pipe) => {
					// Если птица пролетела середину трубы (50px)
					if (pipe.x + PIPE_WIDTH < 50 && !pipe.passedBy.includes(player.id)) {
						player.score += 1;
						pipe.passedBy.push(player.id);
						io.to(player.id).emit("pointScored", player.score);
					}
				});

				// Проверка столкновения
				if (checkCollision(player, room.pipes)) {
					handleHit(player, roomId);
				}
			});

			// Проверка: все ли погибли?
			const anyAlive = players.some((p) => p.alive);
			if (players.length > 0 && !anyAlive) {
				stopGame(roomId);
				// Возврат в лобби через 2 секунды
				setTimeout(() => {
					if (rooms[roomId]) {
						rooms[roomId].status = "LOBBY";
						rooms[roomId].gameActive = false;
						Object.values(rooms[roomId].players).forEach(
							(p) => (p.isReady = false),
						);
						io.to(roomId).emit("gameState", {
							players: rooms[roomId].players,
							pipes: [],
							status: "LOBBY",
						});
					}
				}, 2000);
			}

			// Отправка состояния всем
			io.to(roomId).emit("gameState", {
				players: room.players,
				pipes: room.pipes,
				status: room.status,
			});
		}, 1000 / 60);
	}

	function handleHit(player, roomId) {
		if (player.invulnerable || player.isGhost || !player.alive) return;

		player.lives -= 1;
		if (player.lives > 0) {
			player.invulnerable = true;
			io.to(player.id).emit("hitTaken", player.lives);
			setTimeout(() => {
				player.invulnerable = false;
			}, INVULNERABILITY_TIME);
		} else {
			player.alive = false;
			io.to(player.id).emit("gameOver", { score: player.score });
		}
	}

	function stopGame(roomId) {
		const room = rooms[roomId];
		if (room) {
			clearInterval(room.physicsInterval);
			clearInterval(room.pipeInterval);
			room.status = "ENDED";
		}
	}
};
