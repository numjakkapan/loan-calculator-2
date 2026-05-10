const CACHE_NAME = 'loan-calculator-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err);
        // Continue even if some files fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful GET requests
          if (event.request.method === 'GET') {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(event.request);
        });
    })
  );
});

// Background sync for future use
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(
      Promise.resolve()
    );
  }
});

// Periodic background sync for future use
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-calculations') {
    event.waitUntil(
      Promise.resolve()
    );
  }
});
