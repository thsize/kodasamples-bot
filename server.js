const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const LOCAL_API = "http://127.0.0.1:8081";

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', async (req, res) => {
    const { description, link } = req.body;
    const file = req.files ? req.files.file : null;

    let caption = `<b>KODASAMPLES CLOUD LOG</b>\n\n`;
    if(description) caption += `📝 <b>Pack:</b> ${description}\n`;
    if(link) caption += `🔗 <b>Link:</b> ${link}`;

    try {
        let telegramRes;
        if (file) {
            const form = new FormData();
            form.append('document', fs.createReadStream(file.tempFilePath), { filename: file.name });
            
            telegramRes = await axios.post(`${LOCAL_API}/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}&caption=${encodeURIComponent(caption)}&parse_mode=HTML`, form, {
                headers: form.getHeaders()
            });
        } else {
            telegramRes = await axios.post(`${LOCAL_API}/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: caption,
                parse_mode: 'HTML'
            });
        }

        // Retorna o file_id para o site mostrar no modal (opcional)
        const fileId = telegramRes.data.result.document ? telegramRes.data.result.document.file_id : null;
        res.status(200).json({ ok: true, file_id: fileId });

    } catch (e) {
        console.error("Erro Telegram:", e.message);
        res.status(500).json({ ok: false });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`KodaSamples Pro ativo na porta ${PORT}`));

