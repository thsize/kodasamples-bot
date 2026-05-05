const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configurações
app.use(cors());
app.use(express.json());

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

app.get('/', (req, res) => res.send('Servidor KodaSamples ON! 🚀'));

// Rota de UPLOAD
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('Arquivo não enviado.');

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
    });

    try {
        const response = await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
            headers: formData.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao mandar pro Telegram' });
    }
});

// Rota de DOWNLOAD
app.get('/download', async (req, res) => {
    const fileId = req.query.id;
    if (!fileId) return res.status(400).send('ID faltando');
    try {
        const response = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
        const filePath = response.data.result.file_path;
        res.redirect(`https://api.telegram.org/file/bot${token}/${filePath}`);
    } catch (error) {
        res.status(500).send('Erro no download');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

