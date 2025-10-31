import 'dotenv/config';
import express from 'express';
import { Telegraf, Input } from 'telegraf';
import fs from 'fs';

const {
  BOT_TOKEN,
  PUBLIC_URL,
  WEBHOOK_PATH = '/tg-webhook',
  AUDIO_URL
} = process.env;

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN is missing in .env');
  process.exit(1);
}

const app = express();
const bot = new Telegraf(BOT_TOKEN);

// === ЛОГІКА КОМАНД ===

// /command1 -> надсилає аудіо
bot.command('command1', async (ctx) => {
  console.log('command1')
  try {
    // Пріоритет: AUDIO_URL -> локальний файл
    if (AUDIO_URL) {
      await ctx.replyWithAudio(
        Input.fromURL(AUDIO_URL),
        {
          title: 'My Track',
          performer: 'Your Name',
          caption: 'Тримай трек 🎧'
        }
      );
    } else {
      // локальний файл (переконайся, що він існує: files/track.mp3)
      const path = './files/track.m4a';
      if (!fs.existsSync(path)) {
        return ctx.reply('Аудіо не знайдено. Додай files/track.mp3 або налаштуй AUDIO_URL.');
      }
      await ctx.replyWithAudio(
        { source: fs.createReadStream(path) },
        {
          title: 'My Track',
          performer: 'Your Name',
          caption: 'Тримай трек 🎧'
        }
      );
    }
  } catch (err) {
    console.error('send audio error:', err);
    await ctx.reply('Сталася помилка під час відправки аудіо.');
  }
});

// базові
bot.start((ctx) => ctx.reply('Привіт! Команда: /command1'));
bot.help((ctx) => ctx.reply('Доступно: /command1 — надішлю аудіо'));

// === ВЕБХУК ===
app.use(express.json());

// Telegraf middleware на шлях вебхука
app.use(WEBHOOK_PATH, bot.webhookCallback(WEBHOOK_PATH));

// 1) Встановимо вебхук при старті
const setWebhook = async () => {
  if (!PUBLIC_URL) {
    console.error('PUBLIC_URL is missing in .env (потрібен для вебхука, має бути HTTPS)');
    process.exit(1);
  }
  const url = `${PUBLIC_URL}${WEBHOOK_PATH}`;
  await bot.telegram.setWebhook(url);
  console.log('Webhook set to this url', url);
};

// 2) Запуск сервера
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => res.send('OK')); // healthcheck

app.listen(PORT, async () => {
  console.log(`Listening on :${PORT}`);
  await setWebhook();
});

// Акуратна зупинка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));