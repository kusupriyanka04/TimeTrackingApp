// service-worker.js (simple cache-first for static assets)
const CACHE = 'timetracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/dashboard.html',
  '/timeline.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/dashboard.js',
  '/js/timeline.js',
  '/js/firebase.js',
  '/js/auth.js',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // don't cache firebase API calls
  if (url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com')) return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (event.request.method === 'GET' && resp && resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE).then(c=>c.put(event.request, copy));
        }
        return resp;
      }).catch(()=>{
        if (event.request.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});

