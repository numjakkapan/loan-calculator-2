const CACHE_NAME = 'loan-calculator-v2';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            cache.addAll(urlsToCache).catch(err => {
                console.log('Cache addAll error:', err);
                return Promise.resolve();
            })
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    if (event.request.method === 'GET') {
                        const toCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request));
        })
    );
});
