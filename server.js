const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const upload = multer({ storage: multer.memoryStorage() });

let listaDePacks = [];

app.get('/packs', (req, res) => {
    res.json(listaDePacks);
});

app.post('/upload', upload.fields([{ name: 'file' }, { name: 'photo' }]), async (req, res) => {
    try {
        const { description, link, shortDesc } = req.body;
        const chat_id = process.env.TELEGRAM_CHAT_ID;
        const token = process.env.TELEGRAM_TOKEN;

        let photoBase64 = null;
        if (req.files['photo']) {
            photoBase64 = `data:${req.files['photo'][0].mimetype};base64,${req.files['photo'][0].buffer.toString('base64')}`;
        }

        const novoPack = {
            id: Date.now(),
            title: description,
            description: shortDesc || "Premium Pack",
            link: link || "#",
            image: photoBase64,
            type: req.files['file'] ? "ARQUIVO" : "LINK"
        };

        // Salva no site primeiro para garantir
        listaDePacks.unshift(novoPack);

        // BLOCO DO TELEGRAM (Se der erro aqui, não derruba o site)
        try {
            if (token && chat_id) {
                if (req.files['photo']) {
                    const photoForm = new FormData();
                    photoForm.append('chat_id', chat_id);
                    photoForm.append('photo', req.files['photo'][0].buffer, req.files['photo'][0].originalname);
                    photoForm.append('caption', `🔥 *KODASAMPLES:* ${description}\n📝 ${shortDesc}\n🔗 ${link}`);
                    photoForm.append('parse_mode', 'Markdown');
                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, photoForm, { headers: photoForm.getHeaders() });
                }
                
                if (req.files['file']) {
                    const fileForm = new FormData();
                    fileForm.append('chat_id', chat_id);
                    fileForm.append('document', req.files['file'][0].buffer, req.files['file'][0].originalname);
                    await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, fileForm, { headers: fileForm.getHeaders() });
                }
            }
        } catch (teleError) {
            console.log("Erro ao enviar para o Telegram, mas o pack foi salvo no site.");
        }

        res.status(200).json({ message: "Sucesso no site!" });

    } catch (error) {
        res.status(500).json({ error: "Erro geral" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

