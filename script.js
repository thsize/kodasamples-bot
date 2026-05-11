// 1. URL do seu motor no Render (MANTENHA EXATAMENTE ASSIM)
const API_URL = "https://kodasamples-bot-1.onrender.com"; 

// 2. BUSCAR PACKS DO BANCO DE DADOS
async function fetchPacks() {
    try {
        const res = await fetch(`${API_URL}/packs?t=` + Date.now()); 
        const packs = await res.json();
        
        const grid = document.getElementById('kitsGrid');
        const highlightContainer = document.getElementById('highlightsContainer');
        
        if(grid) grid.innerHTML = ''; // Limpa o grid antes de carregar
        if(highlightContainer) highlightContainer.innerHTML = '';

        packs.forEach((pack, index) => {
            // Se for o primeiro pack, coloca em destaque
            if(index === 0) {
                addHighlight(pack.title, pack.link, pack.image);
            }
            
            // Adiciona todos no grid normal
            addCardToSite(pack.title, pack.description, pack.link, pack.image, pack.category);
        });

    } catch(e) { 
        console.log("Erro ao carregar packs:", e);
    }
}

// 3. ENVIAR NOVO PACK (UPLOAD)
async function startUpload() {
    const name = document.getElementById('upName').value;
    const link = document.getElementById('upLink').value;
    const category = document.getElementById('upCategory').value;

    if(!name || !link) return alert("Preencha os campos!");

    const status = document.getElementById('uploadStatus');
    status.style.display = 'block';
    document.getElementById('uploadModal').classList.remove('active');

    const fd = new FormData();
    fd.append('description', name);
    fd.append('shortDesc', document.getElementById('upDesc').value || 'PREMIUM PACK');
    fd.append('link', link);
    fd.append('category', category);

    if(document.getElementById('imgInput').files[0]) {
        fd.append('photo', document.getElementById('imgInput').files[0]);
    }

    try {
        // CORREÇÃO: Agora enviando para a API_URL do Render
        const res = await fetch(`${API_URL}/upload`, { 
            method: 'POST', 
            body: fd 
        });

        if(res.ok) {
            document.getElementById('progVal').innerText = "100%";
            setTimeout(() => {
                status.style.display = 'none';
                fetchPacks(); // Recarrega a lista
                limparCampos();
            }, 1000);
        }
    } catch (e) { 
        alert("Erro ao subir para o Render"); 
        status.style.display = 'none'; 
    }
}

// --- FUNÇÕES DE INTERFACE (Abaixo mantive igual as suas) ---

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
                <span class="text-[8px] font-black border border-white/20 text-white/60 px-2 py-1 rounded tracking-widest uppercase">NEW RELEASE</span>
            </div>
            <h3 class="text-2xl font-black italic uppercase text-white drop-shadow-2xl" style="font-family: 'Syncopate'; letter-spacing: -1px;">${name}</h3>
        </div>
    `;
    container.appendChild(card);
}

function addCardToSite(name, desc, link, img, cat) {
    const grid = document.getElementById('kitsGrid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'kit-card';
    
    // Normaliza a categoria para o filtro não falhar
    const category = (cat || 'samples').toLowerCase().trim();
    card.setAttribute('data-category', category);

    // Adicionei estilos direto aqui para garantir que o clique seja prioridade
    card.innerHTML = `
        <div class="kit-thumb" onclick="window.open('${link}', '_blank')" style="cursor: pointer; position: relative; z-index: 30;">
            ${img ? `<img src="${img}" style="width:100%; height:100%; object-fit:cover; border-radius: 8px; pointer-events: none;">` : `<i class="fas fa-compact-disc text-white/10 text-4xl"></i>`}
            <div class="download-badge" style="pointer-events: none; z-index: 40;">
                <i class="fas fa-arrow-down text-[12px]"></i>
            </div>
        </div>
        <div style="margin-top: 8px; position: relative; z-index: 30;">
            <h5 class="text-[10px] font-black tracking-wider uppercase truncate" style="color: white;">${name}</h5>
            <p class="text-[9px] text-blue-500 font-bold uppercase mt-1">${category}</p>
        </div>
    `;

    grid.prepend(card);
}

function shareSite() {
    const siteUrl = window.location.href;
    const message = "🔥 Visite o nosso site de packs e samples exclusivos! " + siteUrl;
    navigator.clipboard.writeText(message).then(() => {
        const toast = document.getElementById('copyToast');
        if(toast) {
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 2000);
        }
    });
}

function enterApp() {
    const nameInput = document.getElementById('artistNameInput');
    const name = nameInput ? nameInput.value : "";
    if(name) {
        document.getElementById('displayArtistName').innerText = name;
        localStorage.setItem('koda_artist_name', name);
    }
    document.getElementById('splashScreen').classList.add('hide');
    document.body.style.overflow = 'auto';
    fetchPacks();
}

function switchPage(page) {
    const home = document.getElementById('homePage');
    const profile = document.getElementById('profilePage');
    if(home) home.classList.toggle('active', page === 'home');
    if(profile) profile.classList.toggle('active', page === 'profile');
    window.scrollTo(0,0);
}

function filterCategory(cat) {
    const target = cat.toLowerCase().trim();
    const cards = document.querySelectorAll('.kit-card');

    cards.forEach(card => {
        const cardCat = (card.getAttribute('data-category') || '').toLowerCase().trim();
        if (target === 'all' || cardCat === target) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none';
        }
    });
}

function limparCampos() {
    document.getElementById('upName').value = "";
    document.getElementById('upDesc').value = "";
    document.getElementById('upLink').value = "";
    document.getElementById('pImg').style.display = 'none';
    document.getElementById('camIcon').style.display = 'block';
    document.getElementById('imgInput').value = "";
}

window.onload = () => {
    const mascot = document.getElementById('mascotVideo');
    if(mascot) mascot.play().catch(()=>{});
    
    const savedName = localStorage.getItem('koda_artist_name');
    if(savedName) {
        document.getElementById('displayArtistName').innerText = savedName;
        // Se já tem nome, entra direto
        setTimeout(enterApp, 500); 
    }
};
