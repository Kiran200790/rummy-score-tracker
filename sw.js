// Service Worker for Rummy Score Tracker PWA
const CACHE_NAME = 'rummy-tracker-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Ensure the service worker takes control immediately
    self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension requests
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                // Otherwise, fetch from network
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // Return a custom offline page or fallback response
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // For other resources, you could return a placeholder
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Background sync (for future use)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        // Handle background sync tasks here
        event.waitUntil(
            // Example: sync game data when back online
            console.log('Background sync completed')
        );
    }
});

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Rummy Tracker', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    // Focus or open the app
    event.waitUntil(
        clients.matchAll().then((clientList) => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Send response back to main app
    event.ports[0].postMessage({
        type: 'RESPONSE',
        data: 'Service Worker received message'
    });
});
