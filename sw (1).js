// Minimal service worker — required by browsers to treat JARVIS as an installable app.
// It does NOT cache the Gemini backend calls; only the app shell, so JARVIS always
// talks to your live Apps Script backend, never a stale cached AI response.
const CACHE = 'jarvis-shell-v1';
const SHELL_FILES = ['./JARVIS.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Never intercept calls to the Apps Script backend — always go live.
  if (url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
