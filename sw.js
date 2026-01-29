// sw.js — DARNIT-V2 offline cache (robust)
const VERSION = "darnit-v2-3";
const STATIC_CACHE = `static-${VERSION}`;

// Keep this small + only local files that definitely exist
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);

    // Add files one-by-one so ONE failure doesn't kill install
    await Promise.allSettled(
      PRECACHE.map((url) => cache.add(url))
    );

    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === STATIC_CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle requests for THIS origin
  if (url.origin !== self.location.origin) return;

  // Never intercept the service worker script itself
  if (url.pathname.endsWith("/sw.js") || url.pathname.endsWith("sw.js")) return;

  event.respondWith((async () => {
    // Navigation: network first, fallback to cached index
    if (req.mode === "navigate") {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(STATIC_CACHE);
        cache.put("./index.html", fresh.clone());
        return fresh;
      } catch {
        return (await caches.match("./index.html")) || new Response("Offline", { status: 503 });
      }
    }

    // Other files: cache-first, then network
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      return await fetch(req);
    } catch {
      return new Response("", { status: 504 });
    }
  })());
});
