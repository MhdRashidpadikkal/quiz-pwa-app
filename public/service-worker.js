const CACHE_NAME = 'quizgo-cache-v1';
const urlsToCache = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('[Service Worker] Cache addAll failed:', err);
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Skip non-HTTP(S) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip CDN requests (Tailwind, React, etc.)
  if (event.request.url.includes('cdn.tailwindcss.com') || 
      event.request.url.includes('aistudiocdn.com') ||
      event.request.url.includes('cdn.jsdelivr.net')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Don't cache if not a success response
            if (!response || response.status !== 200) {
              return response;
            }

            // Only cache GET requests
            if (event.request.method !== 'GET') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => {
                console.error('[Service Worker] Cache put failed:', err);
              });
            
            return response;
          }
        ).catch(err => {
          console.error('[Service Worker] Fetch failed:', err);
          throw err;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});