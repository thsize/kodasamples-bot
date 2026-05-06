const express = require('express');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const app = express();

// Configurações de limite (4GB para seus packs pesados)
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 4 * 1024 * 1024 * 1024 }
}));

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

// PÁGINA INICIAL (O site da Unyv Records direto aqui)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Unyv Records - Distribuição</title>
            <style>
                body { background: #0a0a0a; color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 20px; }
                .container { border: 2px solid #00ff7f; padding: 30px; border-radius: 20px; display: inline-block; max-width: 90%; background: #111; box-shadow: 0 0 20px rgba(0,255,127,0.2); }
                h1 { color: #00ff7f; margin-bottom: 5px; }
                p { color: #888; font-size: 14px; }
                input[type="file"] { margin: 20px 0; display: block; width: 100%; color: #888; }
                button { background: #00ff7f; color: black; border: none; padding: 15px 30px; border-radius: 10px; font-weight: bold; cursor: pointer; width: 100%; font-size: 16px; }
                button:hover { background: #00cc66; }
                #progresso { width: 100%; background: #333; height: 12px; border-radius: 6px; margin-top: 20px; display: none; overflow: hidden; }
                #barra { width: 0%; height: 100%; background: #00ff7f; transition: 0.2s; }
                #status { margin-top: 15px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>UNYV RECORDS</h1>
                <p>Upload de Packs e Samples para o Bot</p>
                <input type="file" id="arquivo">
                <button onclick="enviar()">ENVIAR PARA O TELEGRAM</button>
                <div id="progresso"><div id="barra"></div></div>
                <div id="status"></div>
            </div>

            <script>
                function enviar() {
                    const fileInput = document.getElementById('arquivo');
                    const status = document.getElementById('status');
                    const barra = document.getElementById('barra');
                    const progresso = document.getElementById('progresso');

                    if (fileInput.files.length === 0) return alert("Selecione um arquivo primeiro!");

                    const file = fileInput.files[0];
                    const fd = new FormData();
                    fd.append('file', file);

                    const ajax = new XMLHttpRequest();
                    progresso.style.display = 'block';
                    status.innerText = "Iniciando upload...";

                    ajax.upload.onprogress = (e) => {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        barra.style.width = percent + '%';
                        status.innerText = "Subindo Pack: " + percent + "%";
                    };

                    ajax.onload = () => {
                        if (ajax.status === 200) {
                            status.style.color = "#00ff7f";
                            status.innerText = "✅ ENVIADO COM SUCESSO!";
                        } else {
                            status.style.color = "#ff4444";
                            status.innerText = "❌ ERRO NO ENVIO.";
                        }
                    };

                    ajax.open("POST", "/upload");
                    ajax.send(fd);
                }
            </script>
        </body>
        </html>
    `);
});

// ROTA DE UPLOAD (Manda pro Telegram)
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) return res.status(400).send('Sem arquivo.');

    const arquivo = req.files.file;
    const form = new FormData();
    form.append('document', fs.createReadStream(arquivo.tempFilePath), { filename: arquivo.name });

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        res.send('Sucesso');
    } catch (error) {
        console.error('Erro no Bot:', error.message);
        res.status(500).send('Erro');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('Servidor Unyv Records Ativo!'));

