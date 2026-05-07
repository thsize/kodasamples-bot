
# Salva (CTRL+O, ENTER) e sai (CTRL+X)

# Comandos para forçar o envio
git add .
git commit -m "Unyv Records: Deploy definitivo"
git push origin main
# 1. Base oficial do Telegram Bot API
FROM aiogram/telegram-bot-api:latest

# 2. Instala Node.js e NPM com a flag correta
RUN apk add --no-cache nodejs npm

# 3. Define a pasta de trabalho
WORKDIR /app

# 4. Copia e instala as dependências
COPY package*.json ./
RUN npm install

# 5. Copia o resto dos ficheiros
COPY . .

# 6. Portas do sistema
EXPOSE 8080
EXPOSE 8081

# 7. Comando para ligar a Local API e o teu Servidor Node
CMD ["sh", "-c", "telegram-bot-api --local --api-id=${TELEGRAM_API_ID} --api-hash=${TELEGRAM_API_HASH} --http-port=8081 & node server.js"]

t
