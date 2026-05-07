const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuração do Multer para aceitar múltiplos arquivos (o pack e a foto)
const upload = multer({ storage: multer.memoryStorage() });

// LISTA GLOBAL: Onde os packs ficam salvos para todos os celulares verem
let listaDePacks = [];

// Rota para o site carregar os cards (usada no window.onload do index.html)
app.get('/packs', (req, res) => {
    res.json(listaDePacks);
});

// ROTA PRINCIPAL DE UPLOAD
app.post('/upload', upload.fields([{ name: 'file' }, { name: 'photo' }]), async (req, res) => {
    try {
        const { description, link, shortDesc } = req.body;
        const chat_id = process.env.TELEGRAM_CHAT_ID;
        const token = process.env.TELEGRAM_TOKEN;

        // 1. Prepara a imagem para o site (converte em base64)
        let photoBase64 = null;
        if (req.files['photo']) {
            photoBase64 = `data:${req.files['photo'][0].mimetype};base64,${req.files['photo'][0].buffer.toString('base64')}`;
        }

        // 2. Cria o objeto do novo pack
        const novoPack = {
            id: Date.now(),
            title: description,
            description: shortDesc || "Premium Pack",
            link: link || "#",
            image: photoBase64, // Aqui vai a foto que aparece no card
            type: req.files['file'] ? "ARQUIVO" : "LINK"
        };

        // Adiciona no topo da lista para aparecer primeiro no site
        listaDePacks.unshift(novoPack);

        // 3. ENVIO PARA O TELEGRAM
        // Se tiver foto, enviamos a foto com a legenda
        if (req.files['photo']) {
            const photoForm = new FormData();
            photoForm.append('chat_id', chat_id);
            photoForm.append('photo', req.files['photo'][0].buffer, req.files['photo'][0].originalname);
            photoForm.append('caption', `🔥 *KODASAMPLES:* ${description}\n📝 ${shortDesc || ''}\n🔗 ${link || 'Link no site'}`);
            photoForm.append('parse_mode', 'Markdown');

            await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, photoForm, {
                headers: photoForm.getHeaders()
            });
        }

        // Se tiver o arquivo do pack (zip/mp3), enviamos também
        if (req.files['file']) {
            const fileForm = new FormData();
            fileForm.append('chat_id', chat_id);
            fileForm.append('document', req.files['file'][0].buffer, req.files['file'][0].originalname);
            
            await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, fileForm, {
                headers: fileForm.getHeaders()
            });
        }

        res.status(200).json({ message: "Postado com sucesso!" });

    } catch (error) {
        console.error("Erro no servidor:", error);
        res.status(500).json({ error: "Erro ao processar o upload" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Dichava Produtora ON na porta ${PORT}`);
});

