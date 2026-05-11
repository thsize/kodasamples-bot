// 1. URL do seu motor no Render
const API_URL = "https://kodasamples-bot-1.onrender.com"; 

// 2. BUSCAR PACKS
async function fetchPacks() {
    try {
        const res = await fetch(`${API_URL}/packs?t=` + Date.now()); 
        const packs = await res.json();
        
        const grid = document.getElementById('kitsGrid');
        const highlightContainer = document.getElementById('highlightsContainer');
        
        if(grid) grid.innerHTML = ''; 
        if(highlightContainer) highlightContainer.innerHTML = '';

        // Inverte para os novos aparecerem primeiro
        const sortedPacks = packs.reverse();

        sortedPacks.forEach((pack, index) => {
            if(index === 0 && highlightContainer) {
                addHighlight(pack.title, pack.link, pack.image);
            }
            addCardToSite(pack.title, pack.description, pack.link, pack.image, pack.category);
        });

    } catch(e) { 
        console.log("Erro ao carregar packs:", e);
    }
}

// 3. ENVIAR NOVO PACK
async function startUpload() {
    const name = document.getElementById('upName').value;
    const link = document.getElementById('upLink').value;
    const category = document.getElementById('upCategory').value;

    if(!name || !link) return alert("Preencha nome e link!");

    const status = document.getElementById('uploadStatus');
    status.style.display = 'flex'; // Mudado para flex para alinhar o texto
    document.getElementById('uploadModal').classList.remove('active');

    const fd = new FormData();
    fd.append('description', name);
    fd.append('shortDesc', document.getElementById('upDesc').value || 'PREMIUM PACK');
    fd.append('link', link);
    fd.append('category', category);

    const imgFile = document.getElementById('imgInput').files[0];
    if(imgFile) {
        fd.append('photo', imgFile);
    }

    try {
        const res = await fetch(`${API_URL}/upload`, { 
            method: 'POST', 
            body: fd 
        });

        if(res.ok) {
            document.getElementById('progVal').innerText = "100%";
            setTimeout(() => {
                status.style.display = 'none';
                fetchPacks();
                limparCampos();
                alert("Pack publicado com sucesso!");
            }, 1000);
        }
    } catch (e) { 
        alert("Erro na conexão com o servidor."); 
        status.style.display = 'none'; 
    }
}

// --- INTERFACE ---

function addHighlight(name, link, img) {
    const container = document.getElementById('highlightsContainer');
    if(!container) return;
    const card = document.createElement('div');
    card.className = 'highlight-card';
    card.onclick = () => window.open(link, '_blank');
    const bg = img ? `url(${img})` : 'linear-gradient(to br, #1a1a1a, #000)';
    
    card.innerHTML = `
        <div style="background: ${bg}; background-size: cover; background-position: center; width: 100%; height: 100%; opacity: 0.5; position: absolute; inset: 0;"></div>
        <div class="relative z-10 p-8 h-full flex flex-col justify-center">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-[8px] font-black bg-white text-black px-2 py-1 rounded tracking-widest uppercase">DESTAQUE</span>
            </div>
            <h3 class="text-2xl font-black italic uppercase text-white" style="font-family: 'Syncopate';">${name}</h3>
        </div>
    `;
    container.appendChild(card);
}

function addCardToSite(name, desc, link, img, cat) {
    const grid = document.getElementById('kitsGrid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'kit-card';
    const category = (cat || 'samples').toLowerCase().trim();
    card.setAttribute('data-category', category);

    card.innerHTML = `
        <div class="kit-thumb" onclick="window.open('${link}', '_blank')" style="z-index: 50;">
            <img src="${img || 'https://via.placeholder.com/300'}" style="width:100%; height:100%; object-fit:cover; border-radius: 18px;">
            <div class="download-badge">
                <i class="fas fa-arrow-down"></i>
            </div>
        </div>
        <div class="mt-3">
            <h5 class="text-[10px] font-black uppercase truncate text-white">${name}</h5>
            <p class="text-[9px] text-blue-500 font-bold uppercase mt-1">${category}</p>
        </div>
    `;
    grid.appendChild(card);
}

function filterCategory(cat) {
    const target = cat.toLowerCase().trim();
    const cards = document.querySelectorAll('.kit-card');
    const buttons = document.querySelectorAll('.filter-btn');

    // Atualiza botões
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase() === target || (target === 'all' && btn.innerText.toLowerCase() === 'todos'));
    });

    // Filtra cards usando a classe .hidden do CSS
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (target === 'all' || cardCat === target) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function switchPage(page) {
    document.getElementById('homePage').classList.toggle('active', page === 'home');
    document.getElementById('profilePage').classList.toggle('active', page === 'profile');
    
    // Atualiza ícones da nav
    document.getElementById('navHome').classList.toggle('active', page === 'home');
    document.getElementById('navProfile').classList.toggle('active', page === 'profile');
}

window.onload = () => {
    const savedName = localStorage.getItem('koda_artist_name');
    if(savedName) {
        document.getElementById('displayArtistName').innerText = savedName;
        enterApp();
    }
};
