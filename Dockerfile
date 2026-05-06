# Usa a imagem do Telegram Bot API
FROM aiogram/telegram-bot-api:latest

# Corrigido: Instalando nodejs e npm sem o erro do no-update
RUN apk add --no-cache nodejs npm

# Define a pasta do app
WORKDIR /app

# Copia e instala as dependências
COPY package*.json ./
RUN npm install

# Copia o resto dos arquivos
COPY . .

# Portas do site (8080) e do Telegram Local (8081)
EXPOSE 8080
EXPOSE 8081

# Comando de inicialização
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]

