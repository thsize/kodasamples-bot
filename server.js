const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const app = express();

// --- CONFIGURAÇÕES DE ARQUIVO (ATÉ 4GB) ---
app.use(cors());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, 
}));

// --- VARIÁVEIS DO RAILWAY ---
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TELEGRAM_LOCAL_URL = "http://127.0.0.1:8081";

// --- ROTAS ---

app.get('/', (req, res) => {
    res.send('🚀 Unyv Records - Local API 2GB+ Ativa e Pronta');
});

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('Nenhum arquivo recebido.');
    }

    const arquivo = req.files.file;
    const form = new FormData();
    
    // O segredo para arquivos grandes: ler do disco temporário
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { 
        filename: arquivo.name 
    });

    try {
        console.log(`[Unyv Records] Processando pack: ${arquivo.name}`);

        // Envia para o servidor local que instalamos via Docker
        await axios.post(`${TELEGRAM_LOCAL_URL}/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 3600000 // 1 hora de limite
        });

        console.log(`[Sucesso] ${arquivo.name} enviado!`);
        res.send('✅ Pack enviado com sucesso para a Unyv Records!');

    } catch (error) {
        console.error('Erro no Upload Local:', error.response ? error.response.data : error.message);
        res.status(500).send('❌ Erro: O Telegram Local recusou o arquivo ou está offline.');
    }
});

// --- START DO SERVIDOR ---
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log('---------------------------------------------');
    console.log(`UNYV RECORDS - SISTEMA DE UPLOAD ATIVO`);
    console.log(`PORTA: ${PORT} | TIMEOUT: 1 HORA`);
    console.log('---------------------------------------------');
});

// Configurações para a conexão não cair durante o upload
server.timeout = 3600000;
server.keepAliveTimeout = 3600000;
server.headersTimeout = 3601000;

/** * COMENTÁRIO DE FORÇA BRUTA:
 * Este comentário serve para o GitHub detectar uma mudança real
 * e o Railway reconstruir o container do zero com a Local API.
 * Versão do Sistema: 2.1 - Unyv Records Final Build
 */

