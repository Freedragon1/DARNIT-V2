// sw.js — full precache for DARNIT-V2 (GitHub Pages safe)
const VERSION = "darnit-v2-4";
const STATIC_CACHE = `static-${VERSION}`;
const BASE = "/DARNIT-V2/";

// Build full deck file list (matches your naming scheme: AS.png, 0H.png, QD.png, etc.)
const CARD_VALUES = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"];
const SUITS = ["S","H","D","C"];
const CARD_FILES = [];
for (const v of CARD_VALUES) {
  for (const s of SUITS) {
    CARD_FILES.push(`${BASE}cards/${v}${s}.png`);
  }
}
// Deck back (adjust if yours is named differently)
CARD_FILES.push(`${BASE}cards/back.png`);

// List your local assets here (only files that truly exist in the repo root)
const ASSETS = [
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

  // sounds (match your *actual* filenames)
  `${BASE}shuffle.mp3`,
  `${BASE}lose.mp3`,
  `${BASE}fanfare.mp3`,
  `${BASE}crowd.mp3`,
  `${BASE}boing.ogg`,
  `${BASE}clear.ogg`,
  `${BASE}lock.mp3`,
];

const PRECACHE = [
  `${BASE}`,          // important for GitHub Pages
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
  if (url.pathname.endsWith("/sw.js")) return; // don't intercept itself

  event.respondWith((async () => {
    if (req.mode === "navigate") {
      try {
        return await fetch(req);
      } catch {
        return (await caches.match(`${BASE}index.html`)) || new Response("Offline", { status: 503 });
      }
    }

    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      return fresh;
    } catch {
      return new Response("", { status: 504 });
    }
  })());
});
