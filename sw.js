// sw.js — full precache for DARNIT-V2 (GitHub Pages safe)
// Bump VERSION whenever you change files.
const VERSION = "darnit-v2-7";
const STATIC_CACHE = `static-${VERSION}`;
const BASE = "/DARNIT-V2/";

// Build full deck file list (AS.png, 0H.png, QD.png, etc.)
const CARD_VALUES = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"];
const SUITS = ["S","H","D","C"];

const CARD_FILES = [];
for (const v of CARD_VALUES) {
  for (const s of SUITS) {
    CARD_FILES.push(`${BASE}cards/${v}${s}.png`);
  }
}
CARD_FILES.push(`${BASE}cards/back.png`);

// Files in repo root that MUST exist:
const ASSETS = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.json`,

  // icons
  `${BASE}icon-192.png`,
  `${BASE}icon-512.png`,

  // images used by the game
  `${BASE}darnitrules3.jpg`,
  `${BASE}gridfull3.jpg`,
  `${BASE}youlosegrid.jpg`,
  `${BASE}youwin2.jpg`,
  `${BASE}jack.jpg`,
  `${BASE}queen.jpg`,
  `${BASE}king.jpg`,

  // sounds (your confirmed filenames)
  `${BASE}shuffle.mp3`,
  `${BASE}lose.mp3`,
  `${BASE}fanfare.mp3`,
  `${BASE}crowd.mp3`,
  `${BASE}boing.ogg`,
  `${BASE}clear.ogg`,
  `${BASE}lock.mp3`,
];

const PRECACHE = [
  ...ASSETS,
  ...CARD_FILES,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === STATIC_CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

// Cache-first for same-origin requests, with network fallback.
// Navigation falls back to cached index.html when offline.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // Don't intercept itself
  if (url.pathname.endsWith("/sw.js")) return;

  event.respondWith((async () => {
    // Navigation: try network, fallback to cached index
    if (req.mode === "navigate") {
      try {
        return await fetch(req);
      } catch {
        return (await caches.match(`${BASE}index.html`)) || new Response("Offline", { status: 503 });
      }
    }

    // Other requests: cache-first
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      return await fetch(req);
    } catch {
      return new Response("", { status: 504 });
    }
  })());
});
