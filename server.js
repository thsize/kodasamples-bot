const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configurações vindas do Railway (Variáveis de Ambiente)
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// Rota para testar se o servidor está vivo
app.get('/', (req, res) => res.send('Servidor do Thiago ON! 🚀'));

// Rota de Upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).send('Arquivo faltando.');

    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('document', req.file.buffer, req.file.originalname);

    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
            form,
            { headers: form.getHeaders() }
        );
        
        // Devolve o ID para você salvar no seu banco depois
        res.json({
            sucesso: true,
            file_id: response.data.result.document.file_id
        });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao mandar pro Telegram" });
    }
});

// Porta automática para o Railway/Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));

