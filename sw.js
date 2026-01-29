// sw.js (FAILSAFE)
// Version bump this string whenever you change cached files.
const VERSION = "darnit-v2-1";
const STATIC_CACHE = `static-${VERSION}`;

// Keep this list SHORT and only include local files that definitely exist.
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === STATIC_CACHE ? null : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

// IMPORTANT: never hang. Always return something.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle requests for THIS origin (your site).
  if (url.origin !== self.location.origin) return;

  // Always let the browser fetch sw.js directly (avoid self-interception issues)
  if (url.pathname.endsWith("/sw.js") || url.pathname.endsWith("sw.js")) return;

  event.respondWith(
    (async () => {
      // For navigation, try network first, fallback to cached index.html.
      if (req.mode === "navigate") {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(STATIC_CACHE);
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch (e) {
          const cached = await caches.match("./index.html");
          return cached || new Response("Offline", { status: 503 });
        }
      }

      // For other same-origin files: cache-first, then network, then nothing.
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        return fresh;
      } catch (e) {
        return new Response("", { status: 504 });
      }
    })()
  );
});
