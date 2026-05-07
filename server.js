const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const Datastore = require('nedb');
const path = require('path');

const app = express();
// O banco de dados guarda os packs num ficheiro local
const db = new Datastore({ filename: 'packs.db', autoload: true });

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const upload = multer({ storage: multer.memoryStorage() });

// Variáveis que configuraste no Render
const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// 1. ROTA PARA LISTAR OS PACKS NO SITE
app.get('/packs', (req, res) => {
    db.find({}).sort({ timestamp: -1 }).exec((err, docs) => {
        if (err) {
            console.error("Erro ao ler banco:", err);
            return res.status(500).json([]);
        }
        res.json(docs);
    });
});

// 2. ROTA DE UPLOAD (SITE -> SERVIDOR -> TELEGRAM)
app.post('/upload', upload.fields([{ name: 'photo' }, { name: 'file' }]), async (req, res) => {
    try {
        const { description, shortDesc, link } = req.body;
        let telegramPhotoUrl = "";

        if (!TOKEN || !CHAT_ID) {
            console.error("ERRO: BOT_TOKEN ou CHAT_ID não configurados no Render.");
            return res.status(500).send("Configuração incompleta");
        }

        // Enviar para o Telegram
        if (req.files['photo']) {
            const photoForm = new FormData();
            photoForm.append('chat_id', CHAT_ID);
            photoForm.append('photo', req.files['photo'][0].buffer, { filename: 'capa.jpg' });
            photoForm.append('caption', `🔥 *NOVO PACK KODASAMPLES*\n\n📦 ${description}\n📝 ${shortDesc}\n🔗 Link: ${link}`);
            photoForm.append('parse_mode', 'Markdown');

            const telRes = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, photoForm, {
                headers: photoForm.getHeaders()
            });

            // Extrair o link da foto para o card não ficar vazio
            const fileId = telRes.data.result.photo[telRes.data.result.photo.length - 1].file_id;
            const fileInfo = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            telegramPhotoUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.data.result.file_path}`;
        }

        // Salvar os dados do pack no banco NeDB
        const novoPack = {
            title: description,
            description: shortDesc || "Premium Pack",
            link: link,
            image: telegramPhotoUrl,
            timestamp: Date.now()
        };

        db.insert(novoPack, (err, doc) => {
            if (err) {
                console.error("Erro ao inserir no banco:", err);
                return res.status(500).send("Erro ao salvar");
            }
            console.log("Pack salvo com sucesso!");
            res.status(200).json(doc);
        });

    } catch (error) {
        console.error("Erro no processo de upload:", error.message);
        res.status(500).send("Erro interno no servidor");
    }
});

// 3. INICIAR O SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor KodaSamples vivo na porta ${PORT}`);
});

