# Usa a imagem oficial do Telegram Bot API
FROM aiogram/telegram-bot-api:latest

# Instala Node.js e npm (necessários para rodar seu server.js)
RUN apk add --no-cache nodejs npm

# Define a pasta de trabalho
WORKDIR /app

# Copia dependências primeiro para ganhar velocidade no build
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do seu projeto
COPY . .

# Expõe as portas: 8080 (API/Site) e 8081 (Telegram Local)
EXPOSE 8080
EXPOSE 8081

# Comando que liga o Telegram Local e o seu Servidor Node ao mesmo tempo
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]

