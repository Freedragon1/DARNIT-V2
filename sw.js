// sw.js — FULL PRECACHE for DARNIT-V2 (GitHub Pages safe)
const VERSION = "darnit-v2-5";
const STATIC_CACHE = `static-${VERSION}`;
const BASE = "/DARNIT-V2/";

// Build full deck file list (matches naming: AS.png, 0H.png, QD.png, etc.)
const CARD_VALUES = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"];
const SUITS = ["S","H","D","C"];

const CARD_FILES = [];
for (const v of CARD_VALUES) {
  for (const s of SUITS) {
    CARD_FILES.push(`${BASE}cards/${v}${s}.png`);
  }
}
CARD_FILES.push(`${BASE}cards/back.png`);

// Root/site assets (ONLY include files that truly exist)
const ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,

  // images used by the game
  `${BASE}darnitlogo.jpg`,
  `${BASE}darnitrules3.jpg`,
  `${BASE}gridfull3.jpg`,
  `${BASE}youlosegrid.jpg`,
  `${BASE}youwin2.jpg`,
  `${BASE}jack.jpg`,
  `${BASE}queen.jpg`,
  `${BASE}king.jpg`,

  // sounds (match your actual filenames)
  `${BASE}shuffle.mp3`,
  `${BASE}lose.mp3`,
  `${BASE}fanfare.mp3`,
  `${BASE}crowd.mp3`,
  `${BASE}boing.ogg`,
  `${BASE}clear.ogg`,
  `${BASE}lock.mp3`,
];

// Everything to precache
const PRECACHE = [...ASSETS, ...CARD_FILES];

// ----- INSTALL -----
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // If ANY file is missing (404), addAll will throw and install fails.
    await cache.addAll(PRECACHE);
    await self.skipWaiting();
  })());
});

// ----- ACTIVATE -----
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === STATIC_CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

// ----- FETCH -----
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle requests for THIS origin (your GitHub Pages site)
  if (url.origin !== self.location.origin) return;

  // Never intercept the service worker file itself
  if (url.pathname.endsWith("/sw.js") || url.pathname.endsWith("sw.js")) return;

  event.respondWith((async () => {
    // Navigation: network first, offline fallback to cached index.html
    if (req.mode === "navigate") {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch (e) {
        return (await caches.match(`${BASE}index.html`)) || new Response("Offline", { status: 503 });
      }
    }

    // Assets: cache-first, then network
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      return fresh;
    } catch (e) {
      // If offline and not in cache, return an empty response quickly
      return new Response("", { status: 504 });
    }
  })());
});
