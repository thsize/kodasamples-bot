const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const cors = require('cors'); 
const app = express();

// LIBERAÇÃO TOTAL PARA O SEU EDITOR DE HTML
app.use(cors({ origin: '*' })); 

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } 
}));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const LOCAL_API = "http://127.0.0.1:8081";

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) return res.status(400).send('Arquivo não encontrado.');
    const arquivo = req.files.file;
    const form = new FormData();
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { filename: arquivo.name });

    try {
        await axios.post(`${LOCAL_API}/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        res.status(200).send('Sucesso');
    } catch (e) {
        res.status(500).send('Erro no Telegram');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Online na porta ${PORT}`));

