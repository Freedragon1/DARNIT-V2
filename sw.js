/* sw.js - Darnit offline cache (GitHub Pages safe) */

const CACHE_NAME = "darnit-v2-cache-v1";

// Core files (must exist)
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",

  // UI images
  "./darnitlogo.jpg",
  "./darnitrules3.jpg",
  "./gridfull3.jpg",
  "./youlosegrid.jpg",
  "./youwin2.jpg",
  "./king.jpg",
  "./queen.jpg",
  "./jack.jpg",

  // sounds
  "./shuffle.mp3",
  "./clear.ogg",
  "./boing.ogg",
  "./lock.mp3",
  "./lose.mp3",
  "./fanfare.mp3",
  "./crowd.mp3",

  // card back
  "./cards/back.png",
];

// Build full deck list: A,2-9,0,J,Q,K x S,H,D,C
const VALUES = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"];
const SUITS  = ["S","H","D","C"];
const CARD_FILES = [];
for (const v of VALUES) for (const s of SUITS) CARD_FILES.push(`./cards/${v}${s}.png`);

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cache CORE strictly, but don’t fail install if *one* file is missing:
    // (this avoids “no cache storage detected” from a single typo)
    const results = await Promise.allSettled(
      [...CORE, ...CARD_FILES].map(async (url) => {
        const req = new Request(url, { cache: "reload" });
        const res = await fetch(req);
        if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
        await cache.put(req, res);
      })
    );

    // Optional: you can inspect failures by opening DevTools > Application > Service Workers
    // We still activate even if a few files were missing.
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

// Cache-first for same-origin GET requests
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle requests from our own origin (GitHub Pages)
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    const res = await fetch(req);
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, res.clone()).catch(()=>{});
    return res;
  })());
});
