const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const app = express();

// --- CONFIGURAÇÕES DE MIDDLEWARE ---
app.use(cors());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // Suporte para arquivos de até 4GB
    debug: false
}));

// --- VARIÁVEIS DE AMBIENTE ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
// No Docker, o container do Telegram Bot API local roda na porta 8081
const TELEGRAM_LOCAL_URL = "http://127.0.0.1:8081";

// --- ROTAS ---

// Rota de teste para ver se a API está online
app.get('/', (req, res) => {
    res.send('🚀 Unyv Records API Online - Modo: Telegram Local API (2GB+)');
});

// Rota principal de Upload
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    const arquivo = req.files.file;
    const form = new FormData();
    
    // O Servidor Local precisa ler o arquivo do diretório temporário
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { 
        filename: arquivo.name 
    });

    try {
        console.log(`Iniciando upload pesado: ${arquivo.name}`);

        // Chamada para o servidor local (localhost) em vez da URL oficial do Telegram
        const response = await axios.post(`${TELEGRAM_LOCAL_URL}/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 3600000 // Mantém a tentativa de upload ativa por até 1 hora
        });

        console.log(`Sucesso ao enviar: ${arquivo.name}`);
        res.send('✅ Pack enviado com sucesso para a Unyv Records!');

    } catch (error) {
        console.error('Erro no processamento do arquivo:');
        if (error.response) {
            console.error('Dados do erro:', error.response.data);
            res.status(500).send(`Erro do Telegram: ${error.response.data.description}`);
        } else {
            console.error('Mensagem:', error.message);
            res.status(500).send('❌ Erro interno no servidor ao processar o pack.');
        }
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`
    =============================================
    SERVER UNYV RECORDS ATIVO
    Porta: ${PORT}
    Timeout: 1 hora
    Limite: 4GB (Local API)
    =============================================
    `);
});

// Configurações críticas para evitar que o Node.js derrube conexões longas
server.timeout = 3600000;         // 1 hora
server.keepAliveTimeout = 3600000; // 1 hora
server.headersTimeout = 3601000;   // Pouco mais de 1 hora

