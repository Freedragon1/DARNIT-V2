// sw.js — full precache for DARNIT-V2 (GitHub Pages safe)  (FAILSAFE)
const VERSION = "darnit-v2-5";
const STATIC_CACHE = `static-${VERSION}`;
const BASE = "/DARNIT-V2/";

// Build full deck file list (AS.png, 0H.png, QD.png etc.)
const CARD_VALUES = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"];
const SUITS = ["S","H","D","C"];
const CARD_FILES = [];
for (const v of CARD_VALUES) {
  for (const s of SUITS) {
    CARD_FILES.push(`${BASE}cards/${v}${s}.png`);
  }
}
CARD_FILES.push(`${BASE}cards/back.png`);

const ASSETS = [
  `${BASE}index.html`,
  `${BASE}manifest.json`,
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

  // images
  `${BASE}darnitlogo.jpg`,
  `${BASE}darnitrules3.jpg`,
  `${BASE}gridfull3.jpg`,
  `${BASE}youlosegrid.jpg`,
  `${BASE}youwin2.jpg`,
  `${BASE}jack.jpg`,
  `${BASE}queen.jpg`,
  `${BASE}king.jpg`,

  // sounds
  `${BASE}shuffle.mp3`,
  `${BASE}lose.mp3`,
  `${BASE}fanfare.mp3`,
  `${BASE}crowd.mp3`,
  `${BASE}boing.ogg`,
  `${BASE}clear.ogg`,
  `${BASE}lock.mp3`,
];

// Core files that MUST exist for offline to work
const CORE = [
  `${BASE}`,                 // important for GitHub Pages
  `${BASE}index.html`,
  `${BASE}manifest.json`,
];

const PRECACHE = [...CORE, ...ASSETS, ...CARD_FILES];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);

    // 1) Cache core first (fail loudly if these are missing)
    await cache.addAll(CORE);

    // 2) Cache the rest one-by-one (never let one 404 kill the install)
    await Promise.allSettled(
      PRECACHE.map((url) => cache.add(url))
    );

    self.skipWaiting();
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

  if (url.origin !== self.location.origin) return;

  // don’t intercept itself
  if (url.pathname.endsWith("/sw.js") || url.pathname.endsWith("sw.js")) return;

  event.respondWith((async () => {
    if (req.mode === "navigate") {
      try {
        return await fetch(req);
      } catch {
        return (await caches.match(`${BASE}index.html`)) ||
          new Response("Offline", { status: 503 });
      }
    }

    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      return await fetch(req);
    } catch {
      return new Response("", { status: 504 });
    }
  })());
});
