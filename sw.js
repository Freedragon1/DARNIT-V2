// sw.js — MINIMAL TEST VERSION (GitHub Pages)
const CACHE = "darnit-test-1";
const BASE = "/DARNIT-V2/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        BASE,
        BASE + "index.html",
        BASE + "manifest.json",
      ])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((r) => r || fetch(event.request))
  );
});
