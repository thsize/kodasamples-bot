const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Para servir o teu index.html

const upload = multer({ storage: multer.memoryStorage() });

// ESTA É A LISTA QUE TODOS VÃO VER
let listaDePacks = []; 

// Rota para o site puxar os packs ao abrir
app.get('/packs', (req, res) => {
    res.json(listaDePacks);
});

app.post('/upload', upload.fields([{ name: 'file' }, { name: 'photo' }]), async (req, res) => {
    try {
        const { description, link, shortDesc } = req.body;
        
        // Criar o objeto do pack para o site
        const novoPack = {
            id: Date.now(),
            title: description,
            description: shortDesc || "Premium Pack",
            link: link || "#",
            // Convertemos a foto em Base64 para o servidor enviar ao site
            image: req.files['photo'] ? `data:${req.files['photo'][0].mimetype};base64,${req.files['photo'][0].buffer.toString('base64')}` : null,
            type: req.files['file'] ? "ARQUIVO" : "LINK"
        };

        // Adiciona no início da lista global
        listaDePacks.unshift(novoPack);

        // ENVIAR PARA O TELEGRAM (O teu código original)
        const chat_id = process.env.TELEGRAM_CHAT_ID;
        const token = process.env.TELEGRAM_TOKEN;

        if (req.files['photo']) {
            const photoForm = new FormData();
            photoForm.append('chat_id', chat_id);
            photoForm.append('photo', req.files['photo'][0].buffer, req.files['photo'][0].originalname);
            photoForm.append('caption', `🔥 *KODASAMPLES:* ${description}\n📝 ${shortDesc}\n🔗 ${link}`);
            photoForm.append('parse_mode', 'Markdown');
            await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, photoForm, { headers: photoForm.getHeaders() });
        }

        res.status(200).json({ message: "Sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro no servidor" });
    }
});

app.listen(process.env.PORT || 3000, () => console.log("KodaServer ON!"));

