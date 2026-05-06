# Usa a base oficial do Telegram Bot API
FROM aiogram/telegram-bot-api:latest

# Instala Node e NPM com a flag correta para Alpine
RUN apk add --no-cache nodejs npm

# Pasta do projeto
WORKDIR /app

# Instala as dependências primeiro
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos (server.js, index.html)
COPY . .

# Portas da Unyv Records
EXPOSE 8080
EXPOSE 8081

# Inicia o Servidor Local do Telegram + Seu Código Node
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]

