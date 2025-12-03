/**
 * KONFIGURASI API
 * API dipisahkan di sini agar mudah diedit.
 */
const API_BASE = "https://api.ootaizumi.web.id/downloader/";

const services = [
    { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', endpoint: 'snaptik?url=', color: 'group-hover:text-pink-500' },
    { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', endpoint: 'instagram?url=', color: 'group-hover:text-fuchsia-500' },
    { id: 'youtube', name: 'YouTube Play', icon: 'fa-brands fa-youtube', endpoint: 'youtube-play?query=', type: 'query', color: 'group-hover:text-red-500' },
    { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', endpoint: 'facebook?url=', color: 'group-hover:text-blue-500' },
    { id: 'spotify', name: 'Spotify', icon: 'fa-brands fa-spotify', endpoint: 'spotify-v2?url=', color: 'group-hover:text-green-500' },
    { id: 'twitter', name: 'Twitter/X', icon: 'fa-brands fa-twitter', endpoint: 'twitter?url=', color: 'group-hover:text-sky-400' },
    { id: 'pinterest', name: 'Pinterest', icon: 'fa-brands fa-pinterest', endpoint: 'pinterest?url=', color: 'group-hover:text-red-600' },
    { id: 'mediafire', name: 'Mediafire', icon: 'fa-solid fa-fire', endpoint: 'mediafire?url=', color: 'group-hover:text-blue-400' },
    { id: 'gdrive', name: 'GDrive', icon: 'fa-brands fa-google-drive', endpoint: 'gdrive?url=', color: 'group-hover:text-green-400' },
    { id: 'applemusic', name: 'Apple Music', icon: 'fa-brands fa-apple', endpoint: 'applemusic?url=', color: 'group-hover:text-gray-300' },
    { id: 'ncs', name: 'NCS Music', icon: 'fa-solid fa-music', endpoint: 'ncs?tid=', type: 'tid', color: 'group-hover:text-yellow-400' },
    { id: 'telegram', name: 'Sticker TG', icon: 'fa-brands fa-telegram', endpoint: 'telegram-sticker?url=', color: 'group-hover:text-sky-500' },
];

let currentService = null;

// Render Service Grid
const serviceGrid = document.getElementById('serviceGrid');
services.forEach(service => {
    const btn = document.createElement('button');
    btn.className = `group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 p-4 rounded-xl transition flex flex-col items-center gap-2 cursor-pointer`;
    btn.onclick = () => selectService(service, btn);
    btn.innerHTML = `
        <i class="${service.icon} text-2xl text-gray-400 ${service.color} transition"></i>
        <span class="text-xs font-medium text-gray-300 group-hover:text-white">${service.name}</span>
    `;
    serviceGrid.appendChild(btn);
});

// Fungsi Memilih Layanan
function selectService(service, element) {
    currentService = service;
    
    // Reset visual selection
    Array.from(serviceGrid.children).forEach(child => {
        child.classList.remove('ring-2', 'ring-indigo-500', 'bg-slate-700');
    });
    element.classList.add('ring-2', 'ring-indigo-500', 'bg-slate-700');

    // Update Input UI
    const input = document.getElementById('urlInput');
    const label = document.getElementById('inputLabel');
    const btn = document.getElementById('downloadBtn');

    input.disabled = false;
    btn.disabled = false;
    input.value = '';
    
    if (service.type === 'query') {
        input.placeholder = "Masukkan Judul Lagu / Query...";
        label.innerText = `Pencarian ${service.name}`;
    } else if (service.type === 'tid') {
        input.placeholder = "Masukkan Track ID...";
        label.innerText = `Masukkan ID ${service.name}`;
    } else {
        input.placeholder = `Tempel tautan ${service.name} di sini...`;
        label.innerText = `Tempel URL ${service.name}`;
    }
    
    document.getElementById('resultArea').classList.add('hidden');
}

// Fungsi Fetch Data Utama
async function fetchMedia() {
    if (!currentService) return alert("Pilih layanan dulu!");
    const inputVal = document.getElementById('urlInput').value.trim();
    if (!inputVal) return alert("Input tidak boleh kosong!");

    // UI Loading
    const loading = document.getElementById('loading');
    const resultArea = document.getElementById('resultArea');
    const btn = document.getElementById('downloadBtn');
    
    loading.classList.remove('hidden');
    resultArea.classList.add('hidden');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Loading...';

    const fullUrl = `${API_BASE}${currentService.endpoint}${encodeURIComponent(inputVal)}`;

    try {
        const response = await fetch(fullUrl);
        const data = await response.json();

        if (data) {
            displayResult(data);
        } else {
            alert("Gagal mengambil data. Pastikan URL/Query benar.");
        }
    } catch (error) {
        console.error(error);
        alert("Terjadi kesalahan pada server atau koneksi.");
    } finally {
        loading.classList.add('hidden');
        btn.disabled = false;
        btn.innerHTML = '<span>Proses</span><i class="fa-solid fa-bolt"></i>';
    }
}

// Fungsi Menampilkan Hasil (Preview)
function displayResult(data) {
    const resultArea = document.getElementById('resultArea');
    const mediaPreview = document.getElementById('mediaPreview');
    const mediaTitle = document.getElementById('mediaTitle');
    const downloadLink = document.getElementById('downloadLink');

    resultArea.classList.remove('hidden');
    mediaPreview.innerHTML = ''; // Clear old preview

    // Logika Deteksi Konten (Sesuaikan dengan return JSON API kamu)
    // Karena saya tidak bisa melihat output live API, ini adalah logika umum:
    
    let title = data.title || data.caption || data.filename || "Media Found";
    let thumbnail = data.thumbnail || data.cover || data.image || "https://via.placeholder.com/300x200?text=No+Preview";
    let url = data.url || data.download_url || data.link || data.audio || data.video;

    // Khusus Youtube Play dari Ootaizumi (biasanya return yt_url atau download_url)
    if(currentService.id === 'youtube' && data.result) {
        title = data.result.title;
        thumbnail = data.result.thumbnail;
        url = data.result.url_audio || data.result.url; // Prioritas Audio untuk "Play"
    } 
    // Handle struktur data yang dibungkus "result" atau "data"
    else if (data.result) {
        title = data.result.title || title;
        url = data.result.url || url;
        thumbnail = data.result.thumbnail || thumbnail;
    }

    // Set Judul
    mediaTitle.innerText = title;
    
    // Set Tombol Download
    downloadLink.href = url;

    // Logic Preview
    if (currentService.id === 'spotify' || currentService.id === 'applemusic' || currentService.id === 'ncs' || currentService.id === 'youtube') {
        // Audio Preview
        mediaPreview.innerHTML = `
            <div class="text-center w-full">
                <img src="${thumbnail}" class="w-32 h-32 rounded-full mx-auto animate-spin-slow mb-3 border-4 border-indigo-500 object-cover">
                <audio controls class="w-full mt-2">
                    <source src="${url}" type="audio/mpeg">
                    Browser Anda tidak mendukung elemen audio.
                </audio>
            </div>
        `;
    } else {
        // Video/Image Preview
        const fileExt = url ? url.split('.').pop().toLowerCase() : '';
        if (['mp4', 'webm', 'mov'].includes(fileExt)) {
             mediaPreview.innerHTML = `
                <video controls class="w-full rounded-lg max-h-60 bg-black">
                    <source src="${url}" type="video/mp4">
                </video>
            `;
        } else {
            mediaPreview.innerHTML = `
                <img src="${thumbnail}" class="w-full h-48 object-cover rounded-lg opacity-80 hover:opacity-100 transition">
            `;
        }
    }
}

// PWA Logic (Popup)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Tampilkan popup setelah 2 detik
    setTimeout(() => {
        document.getElementById('pwaPopup').classList.add('show');
    }, 2000);
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        document.getElementById('pwaPopup').classList.remove('show');
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW failed', err));
    });
}
