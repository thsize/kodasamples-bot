# 1. Usa a imagem oficial do Telegram Bot API como base
FROM aiogram/telegram-bot-api:latest

# 2. Instala o Node.js e o NPM usando a flag CORRETA (--no-cache)
RUN apk add --no-cache nodejs npm

# 3. Define a pasta onde os arquivos do seu bot vão morar
WORKDIR /app

# 4. Copia os arquivos de configuração primeiro
COPY package*.json ./

# 5. Instala as bibliotecas (express, axios, etc.)
RUN npm install

# 6. Copia o restante dos arquivos (server.js, index.html, etc.)
COPY . .

# 7. Libera as portas para o site (8080) e para o Telegram (8081)
EXPOSE 8080
EXPOSE 8081

# 8. Liga o Servidor Local do Telegram e o seu código Node ao mesmo tempo
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]

