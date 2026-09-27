const CACHE_NAME = 'iron-mind-v2';

// BLOQUE 1: Instalación (El Seed)
// Solo guardamos lo estático que NUNCA cambia de nombre.
const ASSETS_BASE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_BASE))
  );
  self.skipWaiting(); 
});

// BLOQUE 2: Activación (El recolector de basura)
// Si cambias el CACHE_NAME a v3 en el futuro, este bloque borra la v2 vieja.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// BLOQUE 3: El Interceptor (El Proxy Offline)
// Atrapa cualquier petición de red (ej. cuando index.html pide el CSS o JS de Vite).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Si el archivo ya está en el caché local, lo devuelve al instante.
      if (cachedResponse) return cachedResponse;

      // 2. Si no está en el caché, va a internet (Vercel) a buscarlo.
      return fetch(event.request).then((networkResponse) => {
        // 3. Si lo encuentra en Vercel, lo guarda dinámicamente en el caché para la próxima vez.
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    })
  );
});