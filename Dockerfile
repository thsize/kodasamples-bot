FROM aiogram/telegram-bot-api:latest
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
EXPOSE 8081
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]