const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de Upload
app.post('/upload', async (req, res) => {
    const { description, link } = req.body;
    const file = req.files ? req.files.file : null;

    let caption = `<b>KODASAMPLES CLOUD</b>\n\n`;
    if(description) caption += `📝 <b>Pack:</b> ${description}\n`;
    if(link) caption += `🔗 <b>Link:</b> ${link}`;

    try {
        if (file) {
            const form = new FormData();
            form.append('document', fs.createReadStream(file.tempFilePath), { filename: file.name });
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}&caption=${encodeURIComponent(caption)}&parse_mode=HTML`, form, {
                headers: form.getHeaders()
            });
        } else {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID,
                text: caption,
                parse_mode: 'HTML'
            });
        }
        res.status(200).json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KodaSamples Online na porta ${PORT}`);
});
	
