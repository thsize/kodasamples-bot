const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // Limite de 4GB
}));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const TELEGRAM_LOCAL_URL = "http://127.0.0.1:8081";

// Rota para abrir o teu site (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) return res.status(400).send('Nenhum ficheiro recebido.');

    const arquivo = req.files.file;
    const form = new FormData();
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { filename: arquivo.name });

    try {
        console.log(`[Unyv Records] Enviando: ${arquivo.name}`);
        await axios.post(`${TELEGRAM_LOCAL_URL}/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 3600000 
        });
        res.send('✅ Pack enviado com sucesso!');
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).send('❌ Erro no envio local.');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor Unyv na porta ${PORT}`));

