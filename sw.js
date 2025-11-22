// Service Worker for Trondheim Dashboard
// Cache version - increment to force cache refresh
const CACHE_VERSION = 'v1';
const CACHE_NAME = `trondheim-dashboard-${CACHE_VERSION}`;

// Minimal assets - only what's needed for PWA installation
const STATIC_ASSETS = [
    '/manifest.json',
    '/img/icons/icon-192.png',
    '/img/icons/icon-512.png'
];

// Install event - cache minimal assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network-first for everything
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
