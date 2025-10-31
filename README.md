# Telegram Audio Bot

Telegram бот для відправки аудіо файлів.

## Структура проекту

```
tg-audio-bot/
├─ files/
│  └─ track.mp3              # локальний файл (опційно)
├─ src/
│  └─ server.js              # основний файл бота
├─ .env.example              # приклад змінних оточення
├─ package.json              # залежності проекту
├─ Dockerfile                # для Docker контейнера
└─ README.md                 # документація
```

## Налаштування

1. Створіть бота через [@BotFather](https://t.me/BotFather) та отримайте токен

2. Створіть файл `.env` на основі `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Додайте ваш токен у файл `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your_actual_token_here
   ```

4. (Опційно) Додайте аудіо файл `track.mp3` у папку `files/` або вкажіть URL у `.env`

## Запуск

### Локально

```bash
# Встановити залежності
npm install

# Запустити бота
npm start

# Або у режимі розробки з auto-reload
npm run dev
```

### З Docker

```bash
# Збілдити образ
docker build -t tg-audio-bot .

# Запустити контейнер
docker run -d --env-file .env tg-audio-bot
```

## Використання

1. Знайдіть вашого бота в Telegram
2. Відправте `/start` для початку
3. Відправте `/audio` щоб отримати аудіо файл

## Команди бота

- `/start` - привітання
- `/audio` - отримати аудіо файл
