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

// /command1 -> надсилає аудіо як голосове повідомлення
bot.command('command1', async (ctx) => {
  console.log('command1')
  try {
    // Пріоритет: AUDIO_URL -> локальний файл
    if (AUDIO_URL) {
      await ctx.replyWithVoice(Input.fromURL(AUDIO_URL));
    } else {
      // локальний файл (переконайся, що він існує: files/track.m4a)
      const path = './files/track.m4a';
      if (!fs.existsSync(path)) {
        return ctx.reply('Аудіо не знайдено. Додай files/track.m4a або налаштуй AUDIO_URL.');
      }
      await ctx.replyWithVoice({ source: fs.createReadStream(path) });
    }
  } catch (err) {
    console.error('send audio error:', err);
    await ctx.reply('Сталася помилка під час відправки аудіо.');
  }
});

// /command2 -> надсилає текстове повідомлення
bot.command('command2', async (ctx) => {
  console.log('command2');
  try {
    await ctx.reply('Так класно після золотого дощу...)');
  } catch (err) {
    console.error('send message error:', err);
    await ctx.reply('Сталася помилка під час відправки повідомлення.');
  }
});

// базові
bot.start((ctx) => ctx.reply('Привіт! Команди: /command1, /command2'));
bot.help((ctx) => ctx.reply('Доступно:\n/command1 — надішлю аудіо\n/command2 — надішлю текстове повідомлення'));

// === ВЕБХУК ===
app.use(express.json());

// Normalise env values
const BASE_URL = (PUBLIC_URL || '').trim();               // must start with https://
const HOOK_PATH = (WEBHOOK_PATH || '/tg-webhook').trim(); // ensure exact match

// 1) Explicit POST route (reliable)
app.post(HOOK_PATH, (req, res) => {
  // Optionally log to confirm hits:
  // console.log('Webhook hit:', req.method, req.path);
  bot.handleUpdate(req.body, res);
});

// Optional: GET for quick health check on the same path
app.get(HOOK_PATH, (_req, res) => res.status(200).send('Webhook OK'));

// 2) Set webhook at startup
const setWebhook = async () => {
  if (!BASE_URL || !BASE_URL.startsWith('https://')) {
    console.error('PUBLIC_URL must include https:// and not be empty');
    process.exit(1);
  }
  const url = `${BASE_URL}${HOOK_PATH}`;
  await bot.telegram.setWebhook(url);
  console.log('Webhook set to', url);
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