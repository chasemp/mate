/**
 * Service Worker - Enhanced PWA Support
 * Phase 7: Production-ready offline-first caching
 * 
 * Features:
 * - Comprehensive asset caching
 * - Offline-first strategy
 * - Smart cache versioning
 * - Update notifications
 * - Network-first for API calls (if any)
 */

const VERSION = '1.0.0';
const CACHE_NAME = `mate-chess-v${VERSION}`;
const CACHE_URLS = {
  core: `${CACHE_NAME}-core`,      // Essential app shell
  pages: `${CACHE_NAME}-pages`,     // HTML pages
  assets: `${CACHE_NAME}-assets`,   // JS, CSS
  images: `${CACHE_NAME}-images`,   // Icons, piece images
  runtime: `${CACHE_NAME}-runtime`  // Runtime-fetched resources
};

// Critical assets to cache immediately (app shell)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/splash.html',
  '/settings.html',
  '/new-game.html',
  '/ai-setup.html',
  '/manifest.json'
];

// Additional assets to cache (non-blocking)
const EXTENDED_ASSETS = [
  '/css/main.css',
  '/js/app.js',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${VERSION}...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Cache core assets (blocking)
        const coreCache = await caches.open(CACHE_URLS.core);
        await coreCache.addAll(CORE_ASSETS);
        console.log('[SW] Core assets cached');
        
        // Cache extended assets (non-blocking)
        const assetsCache = await caches.open(CACHE_URLS.assets);
        await assetsCache.addAll(EXTENDED_ASSETS).catch(err => {
          console.warn('[SW] Some extended assets failed to cache:', err);
        });
        console.log('[SW] Extended assets cached');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
        console.log(`[SW] Version ${VERSION} installed successfully`);
      } catch (error) {
        console.error('[SW] Installation failed:', error);
        throw error;
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${VERSION}...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        
        // Delete old version caches
        await Promise.all(
          cacheNames
            .filter(name => name.startsWith('mate-chess-') && !name.includes(VERSION))
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
        
        // Take control of all clients immediately
        await self.clients.claim();
        
        // Notify all clients of update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: VERSION
          });
        });
        
        console.log(`[SW] Version ${VERSION} activated successfully`);
      } catch (error) {
        console.error('[SW] Activation failed:', error);
      }
    })()
  );
});

// Fetch event - offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Try cache first (offline-first)
        const cached = await caches.match(request);
        if (cached) {
          console.log('[SW] Serving from cache:', url.pathname);
          return cached;
        }
        
        // Not in cache, fetch from network
        console.log('[SW] Fetching from network:', url.pathname);
        const response = await fetch(request);
        
        // Cache successful responses
        if (response && response.status === 200) {
          const cache = await getCacheForRequest(request);
          if (cache) {
            await cache.put(request, response.clone());
            console.log('[SW] Cached:', url.pathname);
          }
        }
        
        return response;
        
      } catch (error) {
        console.error('[SW] Fetch failed:', error);
        
        // Network failed, try to return a fallback
        const fallback = await getFallback(request);
        if (fallback) {
          return fallback;
        }
        
        // No fallback available
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      }
    })()
  );
});

/**
 * Determine which cache to use for a request
 */
function getCacheForRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname.endsWith('.html')) {
    return caches.open(CACHE_URLS.pages);
  }
  
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    return caches.open(CACHE_URLS.assets);
  }
  
  if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico')) {
    return caches.open(CACHE_URLS.images);
  }
  
  return caches.open(CACHE_URLS.runtime);
}

/**
 * Get fallback content for failed requests
 */
async function getFallback(request) {
  const url = new URL(request.url);
  
  // HTML pages - return index.html
  if (request.headers.get('Accept')?.includes('text/html')) {
    return await caches.match('/index.html');
  }
  
  // Images - return null (let browser handle)
  if (request.headers.get('Accept')?.includes('image')) {
    return null;
  }
  
  return null;
}

// Message event - handle commands from app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // Cache additional URLs on demand
    const urls = event.data.urls || [];
    caches.open(CACHE_URLS.runtime)
      .then(cache => cache.addAll(urls))
      .then(() => {
        event.ports[0].postMessage({ success: true });
      })
      .catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
  }
});

// Log service worker version on startup
console.log(`[SW] Mate Chess Service Worker v${VERSION} loaded`);

