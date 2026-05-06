const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors'); // Para permitir que seu site fale com o Railway
const app = express();

app.use(cors()); // Importante para o link do seu site funcionar

// Configuração para aceitar arquivos grandes (4GB)
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }
}));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Resposta simples para você saber que o link está ativo
app.get('/', (req, res) => {
    res.send('Servidor Unyv Records está ON! Pronto para receber arquivos.');
});

// A rota que recebe o arquivo do seu site
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) return res.status(400).send('Arquivo não recebido.');

    const arquivo = req.files.file;
    const form = new FormData();
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { filename: arquivo.name });

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        res.send('Sucesso no envio!');
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).send('Erro no servidor.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Servidor rodando!'));

