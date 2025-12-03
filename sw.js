// Multi Downloader PRO - Service Worker
const CACHE_NAME = 'multi-downloader-pro-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('PRO Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with offline support
self.addEventListener('fetch', event => {
  // Skip API requests and external resources
  if (event.request.url.includes('api.') || 
      event.request.url.includes('tikwm') ||
      event.request.url.includes('tiktok') ||
      event.request.url.includes('youtube') ||
      event.request.url.includes('instagram') ||
      event.request.url.includes('spotify') ||
      event.request.url.includes('facebook') ||
      event.request.url.includes('corsproxy') ||
      event.request.url.startsWith('blob:')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // If offline and HTML request, return cached HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
        // Return offline page for other requests
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Offline - Multi Downloader PRO</title>
            <style>
              body { font-family: Arial; text-align: center; padding: 50px; }
              h1 { color: #333; }
              p { color: #666; }
            </style>
          </head>
          <body>
            <h1>📡 Offline Mode</h1>
            <p>You are currently offline. Please check your internet connection.</p>
            <p>Some features may not be available.</p>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      })
  );
});

// Background sync for failed downloads
self.addEventListener('sync', event => {
  if (event.tag === 'sync-downloads') {
    console.log('Background sync triggered');
    // You could implement retry logic for failed downloads here
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Multi Downloader PRO is ready!',
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22 fill=%22%233b82f6%22>⬇️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%233b82f6%22/><text x=%2250%22 y=%2260%22 font-family=%22Arial%22 font-size=%2240%22 fill=%22white%22 text-anchor=%22middle%22>M</text></svg>',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Multi Downloader PRO', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
