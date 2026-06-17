const CACHE = 'grace-church-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/index.html', '/app.js', '/features.js', '/style.css'])));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => {
      if (e.request.url.includes('/api/devotionals') || e.request.url.includes('/api/verses')) {
        return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
      }
    }))
  );
});
