const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configurações essenciais
app.use(cors());
app.use(express.json());

// Variáveis vindas do painel do Railway
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

// Rota para testar se o servidor está vivo
app.get('/', (req, res) => {
    res.send('Servidor KodaSamples ON! 🚀');
});

// Rota de UPLOAD (Usada pelo Site e pelo App Android)
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('Nenhum arquivo enviado.');

    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', req.file.buffer, req.file.originalname);

    try {
        const response = await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
            headers: formData.getHeaders()
        });
        // Retorna o sucesso para o App/Site
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao mandar pro Telegram' });
    }
});

// Rota de DOWNLOAD (Usada pelo botão do Site)
app.get('/download', async (req, res) => {
    const fileId = req.query.id;
    if (!fileId) return res.status(400).send('ID do arquivo faltando');

    try {
        // Busca o caminho do arquivo no Telegram
        const response = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
        const filePath = response.data.result.file_path;
        
        // Redireciona o usuário para o link direto do Telegram
        const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        res.redirect(downloadUrl);
    } catch (error) {
        res.status(500).send('Erro ao buscar link de download');
    }
});

// Porta automática do Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

