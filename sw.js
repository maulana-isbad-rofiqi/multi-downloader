// Service Worker for Multi Downloader
const CACHE_NAME = 'multi-downloader-v5';
const urlsToCache = [
  '/',
  '/index.html'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {
  // Skip external APIs
  if (event.request.url.includes('api.') || 
      event.request.url.includes('tikwm') ||
      event.request.url.includes('tiktok') ||
      event.request.url.includes('youtube') ||
      event.request.url.includes('instagram') ||
      event.request.url.includes('corsproxy') ||
      event.request.url.startsWith('blob:')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: 'Multi Downloader siap digunakan!',
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22%233b82f6%22>⬇️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%233b82f6%22/><text x=%2250%22 y=%2260%22 font-family=%22Arial%22 font-size=%2240%22 fill=%22white%22 text-anchor=%22middle%22>M</text></svg>',
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('Multi Downloader', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
