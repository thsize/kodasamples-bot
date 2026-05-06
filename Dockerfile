# Usa uma imagem que já vem com o Telegram Bot API instalado
FROM aiogram/telegram-bot-api:latest

# Instala o Node.js para rodar o seu server.js
RUN apk add --no-update nodejs npm

# Cria a pasta do app
WORKDIR /app

# Copia os arquivos do seu projeto
COPY package*.json ./
RUN npm install

COPY . .

# Expõe as portas (8080 para o site, 8081 para o Telegram interno)
EXPOSE 8080
EXPOSE 8081

# Comando para rodar o Telegram API e o seu Servidor juntos
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]

