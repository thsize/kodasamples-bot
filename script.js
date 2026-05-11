// 1. Primeiro a URL do seu motor (Render)
const API_URL = "https://kodasamples-bot-1.onrender.com"; 

// 2. Depois a sua função que você mandou
async function fetchPacks() {
    try {
        const res = await fetch(`${API_URL}/packs?t=` + Date.now()); // Note o API_URL aqui!
        const packs = await res.json();
        // ... resto do código
    } catch(e) { console.log(e) }
}
function addHighlight(name, link, img) {
    const container = document.getElementById('highlightsContainer');
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

function shareSite() {
    const siteUrl = window.location.href;
    const message = "🔥 Visite o nosso site de packs e samples exclusivos! " + siteUrl;
    navigator.clipboard.writeText(message).then(() => {
        const toast = document.getElementById('copyToast');
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
    });
}

function enterApp() {
    const name = document.getElementById('artistNameInput').value;
    if(name) {
        document.getElementById('displayArtistName').innerText = name;
        localStorage.setItem('koda_artist_name', name);
    }
    document.getElementById('splashScreen').classList.add('hide');
    document.body.style.overflow = 'auto';
    fetchPacks();
}

function switchPage(page) {
    document.getElementById('homePage').classList.toggle('active', page === 'home');
    document.getElementById('profilePage').classList.toggle('active', page === 'profile');
    document.getElementById('navHome').classList.toggle('active', page === 'home');
    document.getElementById('navProfile').classList.toggle('active', page === 'profile');
    window.scrollTo(0,0);
}

document.getElementById('imgInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('pImg').src = ev.target.result;
            document.getElementById('pImg').style.display = 'block';
            document.getElementById('camIcon').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

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

    if(document.getElementById('imgInput').files[0]) fd.append('photo', document.getElementById('imgInput').files[0]);

    try {
        const res = await fetch('/upload', { method: 'POST', body: fd });
        if(res.ok) {
            document.getElementById('progVal').innerText = "100%";
            setTimeout(() => {
                status.style.display = 'none';
                fetchPacks();
                limparCampos();
            }, 1000);
        }
    } catch (e) { alert("Erro ao subir"); status.style.display = 'none'; }
}

function limparCampos() {
    document.getElementById('upName').value = "";
    document.getElementById('upDesc').value = "";
    document.getElementById('upLink').value = "";
    document.getElementById('pImg').style.display = 'none';
    document.getElementById('camIcon').style.display = 'block';
}

function addCardToSite(name, desc, link, img, cat) {
    const grid = document.getElementById('kitsGrid');
    if (!grid) return;

    const card = document.createElement('div');
    card.className = 'kit-card';
    
    const category = (cat || 'samples').toLowerCase().trim();
    card.setAttribute('data-category', category);

    const thumb = img 
        ? `<img src="${img}" style="width:100%; height:100%; object-fit:cover;">` 
        : `<i class="fas fa-compact-disc text-white/10 text-4xl"></i>`;

    card.innerHTML = `
        <div class="kit-thumb" onclick="window.open('${link}', '_blank')">
            ${thumb}
            <div class="download-badge"><i class="fas fa-arrow-down text-[12px]"></i></div>
        </div>
        <div style="margin-top: 8px;">
            <h5 class="text-[10px] font-black tracking-wider uppercase truncate" style="color: white;">${name}</h5>
            <p class="text-[9px] text-blue-500 font-bold uppercase mt-1">${category}</p>
        </div>
    `;

    grid.prepend(card);
}

function filterCategory(cat) {
    const target = cat.toLowerCase().trim();

    document.querySelectorAll('.filter-btn').forEach(btn => {
        const btnCat = btn.getAttribute('data-cat').toLowerCase().trim();
        btn.classList.toggle('active', btnCat === target);
    });

    const grid = document.getElementById('kitsGrid');
    const cards = document.querySelectorAll('.kit-card');

    cards.forEach(card => {
        const cardCat = (card.getAttribute('data-category') || '').toLowerCase().trim();
        
        if (target === 'all' || cardCat === target) {
            card.classList.remove('hidden');
            card.style.display = 'flex'; 
        } else {
            card.classList.add('hidden');
            card.style.display = 'none';
        }
    });

    grid.style.display = 'none';
    grid.offsetHeight; 
    grid.style.display = 'grid';
}

window.onload = () => {
    document.getElementById('mascotVideo').play().catch(()=>{});
    const savedName = localStorage.getItem('koda_artist_name');
    if(savedName) {
        document.getElementById('displayArtistName').innerText = savedName;
        enterApp(); 
    }
};
