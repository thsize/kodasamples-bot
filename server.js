const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const app = express();

// 1. Configurações Iniciais
app.use(cors());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // Limite de 4GB
}));

// 2. Variáveis do Telegram (Railway Environment Variables)
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// 3. Rota de Verificação
app.get('/', (req, res) => {
    res.send('API Unyv Records: Online (Timeout: 1h | Limite: 4GB)');
});

// 4. Rota Principal de Upload
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('Nenhum arquivo foi recebido.');
    }

    const arquivo = req.files.file;
    const form = new FormData();
    
    // Usamos Stream para não sobrecarregar o servidor com arquivos grandes
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { 
        filename: arquivo.name 
    });

    try {
        console.log(`Iniciando envio para o Telegram: ${arquivo.name}`);
        
        // Timeout de 3.600.000ms (1 hora) na requisição do Axios
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 3600000 
        });

        res.send('✅ Pack enviado com sucesso para o Telegram!');
    } catch (error) {
        console.error('Erro no processamento:', error.message);
        res.status(500).send('❌ Erro interno ao tentar enviar o arquivo.');
    }
});

// 5. Configuração de Porta e Timeouts do Servidor
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`Servidor Unyv Records rodando na porta ${PORT}`);
});

// Força o servidor a manter a conexão aberta por 1 hora (3600000ms)
server.timeout = 3600000;
server.keepAliveTimeout = 3600000;
server.headersTimeout = 3601000;

