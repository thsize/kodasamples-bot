const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');
const Datastore = require('nedb'); // Banco de dados leve

const app = express();
const db = new Datastore({ filename: 'packs.db', autoload: true }); // Cria o arquivo de banco

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const upload = multer({ storage: multer.memoryStorage() });

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// ROTA PARA O SITE BUSCAR OS PACKS SALVOS
app.get('/packs', (req, res) => {
    db.find({}).sort({ timestamp: -1 }).exec((err, docs) => {
        if (err) return res.status(500).send(err);
        res.json(docs);
    });
});

// ROTA DE UPLOAD
app.post('/upload', upload.fields([{ name: 'photo' }, { name: 'file' }]), async (req, res) => {
    try {
        const { description, shortDesc, link } = req.body;
        let telegramPhotoUrl = "";

        // 1. Enviar Foto para o Telegram para pegar o link permanente
        if (req.files['photo'] && TOKEN) {
            const photoForm = new FormData();
            photoForm.append('chat_id', CHAT_ID);
            photoForm.append('photo', req.files['photo'][0].buffer, { filename: 'capa.jpg' });
            photoForm.append('caption', `🔥 *KODASAMPLES:* ${description}\n🔗 ${link}`);
            photoForm.append('parse_mode', 'Markdown');

            const telRes = await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, photoForm, {
                headers: photoForm.getHeaders()
            });

            // Pega o ID da foto de maior resolução enviada
            const photos = telRes.data.result.photo;
            const fileId = photos[photos.length - 1].file_id;
            
            // Pega o caminho real da foto nos servidores do Telegram
            const fileInfo = await axios.get(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
            telegramPhotoUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfo.data.result.file_path}`;
        }

        // 2. Salvar no Banco de Dados interno (NeDB)
        const novoPack = {
            title: description,
            description: shortDesc || "Premium Pack",
            link: link,
            image: telegramPhotoUrl, // URL eterna do Telegram
            timestamp: Date.now()
        };

        db.insert(novoPack, (err, doc) => {
            if (err) console.log("Erro ao salvar no banco");
            res.status(200).json(doc);
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Erro no processamento");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KodaServer rodando na porta ${PORT}`));

