// sw.js — GitHub Pages safe
const VERSION = "darnit-v2-2";
const STATIC_CACHE = `static-${VERSION}`;
const BASE = "/DARNIT-V2/";

const PRECACHE = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k === STATIC_CACHE ? null : caches.delete(k)))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith("sw.js")) return;

  event.respondWith(
    (async () => {
      if (req.mode === "navigate") {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(STATIC_CACHE);
          cache.put(BASE + "index.html", fresh.clone());
          return fresh;
        } catch {
          return (
            (await caches.match(BASE + "index.html")) ||
            new Response("Offline", { status: 503 })
          );
        }
      }

      const cached = await caches.match(req);
      if (cached) return cached;

      return fetch(req);
    })()
  );
});
