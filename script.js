// --- KONFIGURASI PLATFORM ---
const platforms = [
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram' },
    { id: 'twitter', name: 'Twitter', icon: 'fab fa-twitter' },
    { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube' },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok' },
    { id: 'spotify', name: 'Spotify', icon: 'fab fa-spotify' },
    { id: 'applemusic', name: 'Apple Music', icon: 'fab fa-apple' },
    { id: 'mediafire', name: 'MediaFire', icon: 'fas fa-cloud-download-alt' },
    { id: 'gdrive', name: 'Google Drive', icon: 'fab fa-google-drive' },
    { id: 'ncs', name: 'NCS Music', icon: 'fas fa-music' }
];

// --- SELEKSI DOM ---
const platformSelect = document.getElementById('platformSelect');
const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusSection = document.getElementById('statusSection');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const statusPercent = document.getElementById('statusPercent');
const progressFill = document.getElementById('progressFill');
const previewSection = document.getElementById('previewSection');
const videoPreview = document.getElementById('videoPreview');
const previewInfo = document.getElementById('previewInfo');
const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');
const platformsGrid = document.getElementById('platformsGrid');
const homeLink = document.getElementById('homeLink');
const aboutLink = document.getElementById('aboutLink');
const homePage = document.getElementById('homePage');
const aboutPage = document.getElementById('aboutPage');

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
    initPlatformCards();
    updatePlaceholder();
    
    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker PWA Terdaftar!'))
            .catch(err => console.log('Gagal daftar SW:', err));
    }
});

// Generate Kartu Platform
function initPlatformCards() {
    platformsGrid.innerHTML = '';
    platforms.forEach(p => {
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.innerHTML = `<div class="platform-icon"><i class="${p.icon}"></i></div><div class="platform-name">${p.name}</div>`;
        card.onclick = () => {
            platformSelect.value = p.id;
            updatePlaceholder();
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.style.transform = '', 200);
        };
        platformsGrid.appendChild(card);
    });
}

function updatePlaceholder() {
    urlInput.placeholder = platformSelect.value === 'ncs' ? 'Masukkan ID Lagu...' : 'Tempel tautan video di sini...';
}

function updateStatus(active, text, percent) {
    if(active) {
        statusSection.classList.add('active');
        statusIndicator.classList.add('active');
    } else {
        statusSection.classList.remove('active');
        statusIndicator.classList.remove('active');
    }
    statusText.innerText = text;
    statusPercent.innerText = percent + '%';
    progressFill.style.width = percent + '%';
}

// --- LOGIKA UTAMA (PROSES DOWNLOAD) ---
async function processDownload() {
    const url = urlInput.value.trim();
    if(!url) { alert('Mohon masukkan URL!'); return; }

    // Reset Tampilan
    previewSection.classList.remove('active');
    resultsSection.classList.remove('active');
    videoPreview.pause();
    videoPreview.src = "";

    // Mulai Proses
    updateStatus(true, 'Menganalisis URL...', 20);
    await new Promise(r => setTimeout(r, 800)); // Simulasi delay
    
    updateStatus(true, 'Mengambil metadata...', 60);
    await new Promise(r => setTimeout(r, 800));

    // --- MOCK API RESPONSE (Ganti bagian ini dengan fetch API aslimu nanti) ---
    // Agar preview akurat, kita simulasikan data lengkap dari server
    const mockData = {
        success: true,
        platform: platformSelect.value === 'auto' ? 'YouTube/Video' : platformSelect.value,
        title: "Video Contoh Hasil Download (Simulasi)",
        duration: "03:45",
        // URL Video Sample (Bisa diputar agar preview terlihat nyata)
        previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        downloads: [
            { quality: "1080p (HD)", format: "MP4", size: "125 MB", url: "#" },
            { quality: "720p (SD)", format: "MP4", size: "68 MB", url: "#" },
            { quality: "360p", format: "MP4", size: "24 MB", url: "#" },
            { quality: "Audio Only", format: "MP3", size: "5 MB", url: "#" }
        ]
    };
    // -------------------------------------------------------------------------

    updateStatus(true, 'Menyiapkan hasil...', 90);
    await new Promise(r => setTimeout(r, 500));
    updateStatus(false, '', 0);

    if(mockData.success) {
        showPreview(mockData);
        displayResults(mockData);
        // Scroll ke bawah
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    } else {
        alert("Gagal mengambil data. Coba lagi.");
    }
}

// Fungsi Menampilkan Preview (Akurat sesuai data)
function showPreview(data) {
    if(data.previewUrl) {
        previewSection.classList.add('active');
        videoPreview.src = data.previewUrl;
        
        previewInfo.innerHTML = `
            <div class="info-item">
                <div class="info-label">Judul</div>
                <div class="info-value">${data.title}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Durasi</div>
                <div class="info-value">${data.duration}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Platform</div>
                <div class="info-value" style="text-transform: capitalize;">${data.platform}</div>
            </div>
        `;
    }
}

// Fungsi Menampilkan Tombol Download
function displayResults(data) {
    resultsSection.classList.add('active');
    resultsGrid.innerHTML = '';

    data.downloads.forEach(item => {
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `
            <div class="result-header">
                <div class="result-title">${item.format}</div>
                <div class="result-quality">${item.quality}</div>
            </div>
            <div class="result-info">
                <div><i class="fas fa-weight-hanging"></i> Ukuran: ${item.size}</div>
            </div>
            <button class="result-download-btn" onclick="alert('Mulai download: ${item.quality}')">
                <i class="fas fa-download"></i> Download
            </button>
        `;
        resultsGrid.appendChild(div);
    });
}

// --- NAVIGASI HALAMAN ---
homeLink.onclick = (e) => { e.preventDefault(); switchPage('home'); };
aboutLink.onclick = (e) => { e.preventDefault(); switchPage('about'); };

function switchPage(page) {
    if(page === 'home') {
        homePage.classList.add('active');
        aboutPage.classList.remove('active');
        homeLink.classList.add('active');
        aboutLink.classList.remove('active');
    } else {
        homePage.classList.remove('active');
        aboutPage.classList.add('active');
        homeLink.classList.remove('active');
        aboutLink.classList.add('active');
    }
}

// Event Listeners
downloadBtn.onclick = processDownload;
platformSelect.onchange = updatePlaceholder;
