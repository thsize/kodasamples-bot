const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Configurações para o Render aceitar o site e os ficheiros
app.use(cors());
app.use(express.static(__dirname));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Variáveis que configuraste no painel do Render
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Rota principal para carregar o teu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de Upload corrigida
app.post('/upload', async (req, res) => {
    const { description, link } = req.body;
    const file = req.files ? req.files.file : null;

    let caption = `<b>KODASAMPLES CLOUD</b>\n\n`;
    if(description) caption += `📝 <b>Pack:</b> ${description}\n`;
    if(link) caption += `🔗 <b>Link:</b> ${link}`;

    try {
        let telegramRes;
        if (file) {
            const form = new FormData();
            form.append('document', fs.createReadStream(file.tempFilePath), { filename: file.name });
            
            telegramRes = await axios.post(`${API_URL}/sendDocument?chat_id=${CHAT_ID}&caption=${encodeURIComponent(caption)}&parse_mode=HTML`, form, {
                headers: form.getHeaders()
            });
        } else {
            telegramRes = await axios.post(`${API_URL}/sendMessage`, {
                chat_id: CHAT_ID,
                text: caption,
                parse_mode: 'HTML'
            });
        }
        
        const fileId = telegramRes.data.result.document ? telegramRes.data.result.document.file_id : "Enviado";
        res.status(200).json({ ok: true, file_id: fileId });

    } catch (e) {
        console.error("Erro no envio:", e.message);
        res.status(500).json({ ok: false, error: e.message });
    }
});

// O SEGREDO: A porta 10000 é a padrão do Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor KodaSamples Online na porta ${PORT}`);
});

