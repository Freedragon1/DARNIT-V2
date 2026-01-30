// sw.js — MINIMAL TEST VERSION
const CACHE = "darnit-test-1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        "/DARNIT-V2/",
        "/DARNIT-V2/index.html",
        "/DARNIT-V2/manifest.json"
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
