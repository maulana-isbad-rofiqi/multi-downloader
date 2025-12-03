/* MULTI DOWNLOADER ENGINE BY ITSBAD
   Versi: 2.0 (Full API Integration)
*/

// --- 1. KONFIGURASI API & DATABASE URL ---
const apiBase = "https://api.ootaizumi.web.id/downloader/";

/* DAFTAR LENGKAP API 
   Format: 
   key: ID Unik
   match: Domain website untuk Auto-Detect
   apis: Daftar endpoint API (Utama & Cadangan)
*/
const platforms = {
    // --- KELOMPOK 1: PLATFORM POPULER (DENGAN CADANGAN) ---
    tiktok: {
        name: "TikTok",
        icon: "fa-brands fa-tiktok",
        match: ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
        apis: [
            { end: "tiktok", param: "url" },    // API Baru
            { end: "ssstiktok", param: "url" }, // API Baru (Cadangan 1)
            { end: "snaptik", param: "url" }    // API Lama (Cadangan 2)
        ]
    },
    youtube: {
        name: "YouTube",
        icon: "fa-brands fa-youtube",
        match: ["youtube.com", "youtu.be"],
        apis: [
            { end: "youtube", param: "url", extra: "&format=mp4" }, // API Baru
            { end: "youtubev2", param: "url" },                     // API Baru (Cadangan 1)
            { end: "youtube-play", param: "query" }                 // API Lama (Cadangan 2 / Search)
        ]
    },
    spotify: {
        name: "Spotify",
        icon: "fa-brands fa-spotify",
        match: ["open.spotify.com", "spotify.link"],
        apis: [
            { end: "spotify-v2", param: "url" }, // API Lama & Baru
            { end: "spotify", param: "url" }     // API Baru (Cadangan)
        ]
    },

    // --- KELOMPOK 2: MEDIA SOSIAL LAIN ---
    instagram: {
        name: "Instagram",
        icon: "fa-brands fa-instagram",
        match: ["instagram.com"],
        apis: [ { end: "instagram", param: "url" } ] // API Lama
    },
    facebook: {
        name: "Facebook",
        icon: "fa-brands fa-facebook",
        match: ["facebook.com", "fb.watch"],
        apis: [ { end: "facebook", param: "url" } ] // API Lama
    },
    twitter: {
        name: "Twitter/X",
        icon: "fa-brands fa-x-twitter",
        match: ["twitter.com", "x.com"],
        apis: [ { end: "twitter", param: "url" } ] // API Lama
    },
    pinterest: {
        name: "Pinterest",
        icon: "fa-brands fa-pinterest",
        match: ["pinterest.com", "pin.it"],
        apis: [ { end: "pinterest", param: "url" } ] // API Lama
    },
    rednote: {
        name: "RedNote",
        icon: "fa-solid fa-book-journal-whills",
        match: ["xiaohongshu.com"],
        apis: [ { end: "rednote", param: "url" } ] // API Baru
    },
    telegram: {
        name: "Tele Sticker",
        icon: "fa-brands fa-telegram",
        match: ["t.me/addstickers"],
        apis: [ { end: "telegram-sticker", param: "url" } ] // API Lama
    },

    // --- KELOMPOK 3: STORAGE & DOKUMEN ---
    gdrive: {
        name: "G-Drive",
        icon: "fa-brands fa-google-drive",
        match: ["drive.google.com"],
        apis: [ { end: "gdrive", param: "url" } ] // API Lama
    },
    mediafire: {
        name: "Mediafire",
        icon: "fa-solid fa-fire",
        match: ["mediafire.com"],
        apis: [ { end: "mediafire", param: "url" } ] // API Lama
    },
    sfile: {
        name: "Sfile.mobi",
        icon: "fa-solid fa-folder-open",
        match: ["sfile.mobi"],
        apis: [ { end: "sfile", param: "url" } ] // API Baru
    },
    scribd: {
        name: "Scribd",
        icon: "fa-solid fa-book-open",
        match: ["scribd.com"],
        apis: [ { end: "scribd", param: "url" } ] // API Baru
    },

    // --- KELOMPOK 4: MUSIK KHUSUS ---
    soundcloud: {
        name: "SoundCloud",
        icon: "fa-brands fa-soundcloud",
        match: ["soundcloud.com"],
        apis: [ { end: "soundcloud", param: "url" } ] // API Baru
    },
    applemusic: {
        name: "Apple Music",
        icon: "fa-brands fa-apple",
        match: ["music.apple.com"],
        apis: [ { end: "applemusic", param: "url" } ] // API Lama
    },
    ncs: {
        name: "NCS Music",
        icon: "fa-solid fa-music",
        match: ["ncs.io"], // Asumsi URL, jika TID manual pilih mode
        apis: [ { end: "ncs", param: "tid" } ] // API Lama
    },

    // --- KELOMPOK 5: PENCARIAN (MANUAL ONLY) ---
    // Ini API yang Anda minta untuk 'query', bukan 'url'
    ytsearch: {
        name: "Cari Lagu YT",
        icon: "fa-solid fa-magnifying-glass",
        isSearch: true,
        apis: [ { end: "youtube-play", param: "query" } ] // API Lama
    },
    spotsearch: {
        name: "Cari Lagu Spotify",
        icon: "fa-brands fa-spotify",
        isSearch: true,
        apis: [ { end: "spotifyplay", param: "query" } ] // API Baru
    }
};

// Global State
let currentMode = 'auto'; 

// --- 2. FUNGSI INISIALISASI UI ---
document.addEventListener('DOMContentLoaded', () => {
    generateGrid();
    
    // Setup Service Worker untuk PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
    }
});

function generateGrid() {
    const grid = document.getElementById('serviceGrid');
    if(!grid) return;
    
    Object.keys(platforms).forEach(key => {
        const p = platforms[key];
        const div = document.createElement('div');
        div.className = "glass p-3 rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-700/50 transition active:scale-95 border border-transparent hover:border-slate-600";
        div.onclick = () => setManualMode(key);
        div.innerHTML = `
            <i class="${p.icon} text-2xl text-slate-300"></i>
            <span class="text-[10px] font-semibold text-slate-400 text-center leading-tight">${p.name}</span>
        `;
        grid.appendChild(div);
    });
}

// --- 3. AUTO DETECT SYSTEM ---
window.checkAutoDetect = function(val) {
    const icon = document.getElementById('inputIcon');
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const actionBtn = document.getElementById('actionBtn');

    if (!val) {
        resetMode();
        return;
    }

    // Loop untuk cek kecocokan domain di semua platform
    let detected = null;
    for (const [key, data] of Object.entries(platforms)) {
        if (data.match && data.match.some(domain => val.includes(domain))) {
            detected = key;
            break;
        }
    }

    if (detected) {
        currentMode = detected;
        const p = platforms[detected];
        icon.className = `${p.icon} text-blue-400 transition-colors`;
        statusBadge.classList.remove('hidden');
        statusText.innerText = `Terdeteksi: ${p.name}`;
        statusText.className = "text-blue-400 text-sm font-semibold";
        actionBtn.classList.add('animate-ring');
    } else {
        // Jika input ada tapi tidak cocok (mungkin sedang mode manual atau unknown)
        if(currentMode === 'auto') {
            icon.className = "fa-solid fa-link text-slate-500";
            statusBadge.classList.add('hidden');
            actionBtn.classList.remove('animate-ring');
        }
    }
}

window.setManualMode = function(key) {
    currentMode = key;
    const p = platforms[key];
    const input = document.getElementById('urlInput');
    
    document.getElementById('inputIcon').className = `${p.icon} text-blue-400`;
    document.getElementById('statusBadge').classList.remove('hidden');
    document.getElementById('statusText').innerText = `Mode Manual: ${p.name}`;
    
    if(p.isSearch) {
        input.placeholder = `Ketik judul lagu untuk ${p.name}...`;
        document.getElementById('btnText').innerText = "Cari";
    } else {
        input.placeholder = `Tempel link ${p.name} di sini...`;
        document.getElementById('btnText').innerText = "Download";
    }
    input.value = '';
    input.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.resetMode = function() {
    currentMode = 'auto';
    document.getElementById('inputIcon').className = "fa-solid fa-link text-slate-500";
    document.getElementById('statusBadge').classList.add('hidden');
    document.getElementById('urlInput').placeholder = "Tempel link di sini...";
    document.getElementById('btnText').innerText = "Download";
    document.getElementById('actionBtn').classList.remove('animate-ring');
}

// --- 4. ENGINE UTAMA: PROSES DOWNLOAD ---
window.processInput = async function() {
    const input = document.getElementById('urlInput').value.trim();
    if (!input) return alert("Harap masukkan link atau kata kunci!");

    // Validasi Auto Mode
    if (currentMode === 'auto') {
        if (!input.startsWith('http')) return alert("Gunakan fitur 'Cari Lagu' di bawah untuk pencarian judul.");
        alert("Link tidak dikenali otomatis. Silakan pilih ikon platform secara manual di bawah.");
        return;
    }

    const platformData = platforms[currentMode];
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    const loadingText = document.getElementById('loadingText');

    // Reset UI
    resultSection.classList.add('hidden');
    loader.classList.remove('hidden');
    document.getElementById('resultContent').innerHTML = ''; 

    // --- LOGIKA MULTI-API (FALLBACK SYSTEM) ---
    // Script akan mencoba API pertama, jika error, lanjut ke API kedua, dst.
    let success = false;
    
    for (let i = 0; i < platformData.apis.length; i++) {
        const api = platformData.apis[i];
        
        // Update status loading ke user
        loadingText.innerText = `Menghubungkan Server ${i + 1} (${platformData.name})...`;
        
        try {
            let fetchUrl = `${apiBase}${api.end}?${api.param}=${encodeURIComponent(input)}`;
            if (api.extra) fetchUrl += api.extra;

            console.log(`Trying: ${fetchUrl}`); // Debugging

            const response = await fetch(fetchUrl);
            const json = await response.json();

            // Validasi Respon API (Setiap API mungkin beda struktur)
            // Kita cek apakah ada properti penting (url, result, data, dll)
            if (json && (json.url || json.result || json.data || Array.isArray(json.result))) {
                renderResult(json);
                success = true;
                break; // BERHASIL! Keluar dari loop
            }
        } catch (e) {
            console.warn(`Server ${i + 1} Gagal:`, e);
            // Tidak perlu alert, loop akan otomatis lanjut ke server berikutnya
        }
    }

    loader.classList.add('hidden');

    if (!success) {
        alert(`Gagal! Semua server ${platformData.name} sedang sibuk atau link bersifat privat/tidak valid.`);
    }
}

// --- 5. RENDER HASIL (VISUALISASI DATA) ---
function renderResult(data) {
    const container = document.getElementById('resultContent');
    const section = document.getElementById('resultSection');
    
    // Normalisasi Data (Menangani perbedaan struktur JSON API)
    let d = data.result || data.data || data; 
    
    // Jika hasil berupa Array (misal search result), ambil yang pertama untuk preview utama
    let mainData = Array.isArray(d) ? d[0] : d;

    // Ambil Thumbnail & Judul
    let thumb = mainData.thumbnail || mainData.cover || mainData.image || 'https://via.placeholder.com/300x200?text=No+Preview';
    let title = mainData.title || mainData.caption || mainData.name || mainData.filename || 'Hasil Download';
    
    // Bersihkan HTML Title yang kotor (opsional)
    title = title.replace(/<[^>]*>?/gm, '');

    // --- PEMBUATAN TOMBOL DOWNLOAD ---
    // Helper function untuk membuat HTML tombol
    const btn = (url, label, icon = 'fa-download', color = 'bg-slate-700') => `
        <a href="${url}" target="_blank" class="w-full ${color} hover:bg-slate-600 border border-slate-600 text-white py-3 px-4 rounded-xl flex items-center justify-between group transition mb-2 shadow-md">
            <span class="flex items-center gap-3 text-sm font-semibold"><i class="fa-solid ${icon} text-blue-400"></i> ${label}</span>
            <i class="fa-solid fa-cloud-arrow-down text-slate-400 group-hover:text-white"></i>
        </a>`;

    let buttonsHtml = '';

    // 1. Cek Struktur "Download" (biasanya YouTube/NCS)
    if (mainData.download && mainData.download.url) {
        buttonsHtml += btn(mainData.download.url, 'Download Media Utama', 'fa-circle-down', 'bg-slate-800');
    }
    
    // 2. Cek Struktur Flat (Langsung ada di root object)
    if (mainData.url) buttonsHtml += btn(mainData.url, 'Download File');
    if (mainData.video) buttonsHtml += btn(mainData.video, 'Download Video (MP4)', 'fa-video');
    if (mainData.audio) buttonsHtml += btn(mainData.audio, 'Download Audio (MP3)', 'fa-music');
    if (mainData.hd) buttonsHtml += btn(mainData.hd, 'Kualitas HD', 'fa-video');
    if (mainData.sd) buttonsHtml += btn(mainData.sd, 'Kualitas SD', 'fa-video');
    
    // 3. Fallback jika response hanya string URL
    if (typeof d === 'string' && d.startsWith('http')) {
        buttonsHtml += btn(d, 'Download File Langsung');
    }

    // 4. Handle Array Results (Slide Instagram / Search Result / Playlist)
    if (Array.isArray(d) && d.length > 0) {
         d.forEach((item, idx) => {
             // Jika item string (url gambar/video langsung)
             if(typeof item === 'string') {
                 buttonsHtml += btn(item, `Media Slide ${idx+1}`, 'fa-image');
             } 
             // Jika item object (hasil search youtube/spotify)
             else if(item.url) {
                 const label = item.title ? `Download: ${item.title}` : `Track ${idx+1}`;
                 buttonsHtml += btn(item.url, label, 'fa-play');
             }
         });
    }

    // Render ke HTML
    container.innerHTML = `
        <div class="flex flex-col md:flex-row gap-6">
            <div class="w-full md:w-1/3 shrink-0">
                <div class="relative group">
                    <img src="${thumb}" class="w-full rounded-xl shadow-lg border border-slate-600/50 aspect-video object-cover" alt="Preview">
                    <div class="absolute inset-0 bg-black/20 rounded-xl"></div>
                </div>
            </div>
            <div class="w-full md:w-2/3">
                <h3 class="text-lg font-bold text-white mb-4 line-clamp-2 leading-snug">${title}</h3>
                <div class="bg-slate-800/30 rounded-xl p-2 border border-slate-700/50">
                    <p class="text-xs text-slate-400 mb-2 px-1 uppercase font-bold tracking-wider">Link Download:</p>
                    <div class="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scroll">
                        ${buttonsHtml || '<div class="text-center py-4 text-red-400 text-sm">Link tidak ditemukan dalam respon API.</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    section.classList.remove('hidden');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.closeResult = function() {
    document.getElementById('resultSection').classList.add('hidden');
}

// --- 6. UTILITAS MODAL & PWA ---
window.toggleModal = function(id) { 
    document.getElementById(id).classList.toggle('hidden'); 
}

// PWA Logic Sederhana
window.closePwa = function() { 
    document.getElementById('pwaPopup').classList.add('translate-y-full'); 
}
