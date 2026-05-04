const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Variáveis que você configurou no Railway
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

// Rota principal para saber se está ON
app.get('/', (req, res) => {
    res.send('Servidor do Thiago ON! 🚀');
});

// Rota de UPLOAD (App e Site)
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', req.file.buffer, req.file.originalname);

    try {
        const response = await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
            headers: formData.getHeaders()
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao mandar pro Telegram' });
    }
});

// Rota de DOWNLOAD (Para o botão do seu Site)
app.get('/download', async (req, res) => {
    const fileId = req.query.id;
    if (!fileId) return res.status(400).send('ID do arquivo faltando');

    try {
        const response = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
        const filePath = response.data.result.file_path;
        res.redirect(`https://api.telegram.org/file/bot${token}/${filePath}`);
    } catch (error) {
        res.status(500).send('Erro ao buscar arquivo no Telegram');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

