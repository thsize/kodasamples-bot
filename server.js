const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Libera o acesso para o site falar com o servidor
app.use(cors());
app.use(express.static(__dirname));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

// Suas variáveis do Railway
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
// Importante: Para o Railway falar com o Telegram, usamos a API oficial direto
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', async (req, res) => {
    const { description, link } = req.body;
    const file = req.files ? req.files.file : null;

    let msg = `<b>KODASAMPLES CLOUD</b>\n\n`;
    if(description) msg += `📝 <b>Pack:</b> ${description}\n`;
    if(link) msg += `🔗 <b>Link:</b> ${link}`;

    try {
        let response;
        if (file) {
            const form = new FormData();
            form.append('document', fs.createReadStream(file.tempFilePath), { filename: file.name });
            // Envia para a API oficial do Telegram
            response = await axios.post(`${TELEGRAM_API}/sendDocument?chat_id=${CHAT_ID}&caption=${encodeURIComponent(msg)}&parse_mode=HTML`, form, {
                headers: form.getHeaders()
            });
        } else {
            response = await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: CHAT_ID,
                text: msg,
                parse_mode: 'HTML'
            });
        }
        
        const fId = response.data.result.document ? response.data.result.document.file_id : null;
        res.status(200).json({ ok: true, file_id: fId });
    } catch (e) {
        console.error("Erro no Telegram:", e.response ? e.response.data : e.message);
        res.status(500).json({ ok: false, error: e.message });
    }
});

// A PORTA TEM QUE SER ESSA PARA O RAILWAY FUNCIONAR
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor KodaSamples rodando na porta ${PORT}`);
});

