FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

# Переконайся, що локальне аудіо (files/track.mp3) скопійовано, якщо ти так використовуєш
# Якщо все через AUDIO_URL — каталогу files може не бути

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]