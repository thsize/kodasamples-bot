const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("🔥 Banco de Dados MongoDB Conectado!"))
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// --- 1. MODELO ATUALIZADO COM CATEGORIA ---
const PackSchema = new mongoose.Schema({
    title: String,
    description: String,
    link: String,
    image: String,
    category: { type: String, default: 'samples' }, // Campo essencial para os filtros
    timestamp: { type: Date, default: Date.now }
});
const Pack = mongoose.model('Pack', PackSchema);

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const upload = multer({ storage: multer.memoryStorage() });

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// --- 2. ROTA DE LISTAGEM ---
app.get('/packs', async (req, res) => {
    try {
        const packs = await Pack.find().sort({ timestamp: -1 });
        res.json(packs);
    } catch (err) {
        res.status(500).json([]);
    }
});

// --- 3. ROTA DE UPLOAD ATUALIZADA ---
app.post('/upload', upload.fields([{ name: 'photo' }]), async (req, res) => {
    try {
        const { description, shortDesc, link, category } = req.body; // Pega a categoria do site
        let telegramPhotoUrl = "";

        if (req.files['photo']) {
            const photoForm = new FormData();
            photoForm.append('chat_id', CHAT_ID);
            photoForm.append('photo', req.files['photo'][0].buffer, { filename: 'capa.jpg' });
            photoForm.append('caption', `🔥 *KODASAMPLES:* ${description}\n📂 Cat: ${category}\n\n🔗 Link: ${link}`);
            photoForm.append('parse_mode', 'Markdown');

            const telRes = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, photoForm, {
                headers: photoForm.getHeaders()
            });                                                                                                                                                                                                      
            const fileId = telRes.data.result.photo[telRes.data.result.photo.length - 1].file_id;
            const fileInfo = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            telegramPhotoUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.data.result.file_path}`;
        }

        const novoPack = new Pack({
            title: description,
            description: shortDesc || "Premium Pack",
            link: link,
            category: category || "samples", // Salva a categoria no banco
            image: telegramPhotoUrl
        });

        await novoPack.save();
        res.status(200).json(novoPack);
    } catch (error) {
        res.status(500).send("Erro ao processar upload.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor na porta ${PORT}`));

