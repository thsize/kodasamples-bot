const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 1. Configurações de Limite e Temporários
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/', // O Railway limpa essa pasta automaticamente
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // Limite de 4GB
    abortOnLimit: true
}));

app.use(express.static('public'));

// 2. Rota de Upload
app.post('/upload', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        const arquivo = req.files.file;
        const BOT_TOKEN = process.env.BOT_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        console.log(`Iniciando envio: ${arquivo.name} (${(arquivo.size / 1024 / 1024).toFixed(2)} MB)`);

        // 3. Criando o formulário de envio usando Stream (Essencial para 4GB)
        const form = new FormData();
        form.append('document', fs.createReadStream(arquivo.tempFilePath), {
            filename: arquivo.name,
            knownLength: arquivo.size
        });

        // 4. Enviando para o Telegram com timeout infinito
        const response = await axios.post(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`,
            form,
            {
                headers: form.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 0 // Sem limite de tempo no servidor para arquivos gigantes
            }
        );

        // 5. Retorna o sucesso para o seu site
        res.json({
            success: true,
            file_id: response.data.result.document.file_id
        });

    } catch (error) {
        console.error('Erro no upload:', error.message);
        res.status(500).json({ error: 'Erro ao processar arquivo pesado.' });
    }
});

// 6. Ajuste de Timeout do Servidor Node
const server = app.listen(PORT, () => {
    console.log(`Servidor Unyv Records rodando na porta ${PORT}`);
});

// Define o tempo de espera da conexão para 2 horas (em milissegundos)
server.timeout = 7200000;

