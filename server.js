const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1. CONEXÃO COM O MONGODB
// A variável MONGO_URI deve estar configurada no painel do Render
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("🔥 Banco de Dados MongoDB Conectado!"))
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// 2. MODELO DE DADOS (O que será salvo no banco)
const PackSchema = new mongoose.Schema({
    title: String,
    description: String,
    link: String,
    image: String,
    timestamp: { type: Date, default: Date.now }
});
const Pack = mongoose.model('Pack', PackSchema);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const upload = multer({ storage: multer.memoryStorage() });

// Configurações do Bot (Vindas do Render)
const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// 3. ROTA PARA LISTAR OS PACKS NO SITE
app.get('/packs', async (req, res) => {
    try {
        // Puxa todos os packs do MongoDB ordenados pelo mais recente
        const packs = await Pack.find().sort({ timestamp: -1 });
        res.json(packs);
    } catch (err) {
        console.error("Erro ao buscar packs:", err);
        res.status(500).json([]);
    }
});

// 4. ROTA DE UPLOAD (SITE -> TELEGRAM -> MONGODB)
app.post('/upload', upload.fields([{ name: 'photo' }, { name: 'file' }]), async (req, res) => {
    try {
        const { description, shortDesc, link } = req.body;
        let telegramPhotoUrl = "";

        // Validar se o Bot está configurado
        if (!TOKEN || !CHAT_ID) {
            return res.status(500).send("Bot não configurado no servidor.");
        }

        // A. Enviar a imagem para o Telegram
        if (req.files['photo']) {
            const photoForm = new FormData();
            photoForm.append('chat_id', CHAT_ID);
            photoForm.append('photo', req.files['photo'][0].buffer, { filename: 'capa.jpg' });
            photoForm.append('caption', `🔥 *KODASAMPLES:* ${description}\n\n📝 ${shortDesc}\n🔗 Link: ${link}`);
            photoForm.append('parse_mode', 'Markdown');

            const telRes = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, photoForm, {
                headers: photoForm.getHeaders()
            });

            // B. Pegar o link real da imagem nos servidores do Telegram
            const fileId = telRes.data.result.photo[telRes.data.result.photo.length - 1].file_id;
            const fileInfo = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            telegramPhotoUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.data.result.file_path}`;
        }

        // C. Salvar as informações permanentemente no MongoDB
        const novoPack = new Pack({
            title: description,
            description: shortDesc || "Premium Pack",
            link: link,
            image: telegramPhotoUrl
        });

        await novoPack.save();
        console.log("✅ Pack salvo no MongoDB e enviado ao Telegram!");
        res.status(200).json(novoPack);

    } catch (error) {
        console.error("Erro no processo de upload:", error);
        res.status(500).send("Erro ao processar upload.");
    }
});

// 5. INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor KodaSamples rodando na porta ${PORT}`);
});

