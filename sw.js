/* sw.js — Darnit V2 robust offline cache for GitHub Pages */

const VERSION = "darnit-v2-2026-01-29";
const CACHE_NAME = `darnit-cache-${VERSION}`;

// Core files in repo root you want available offline immediately
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  // your local images in repo root
  "./darnitlogo.jpg",
  "./darnitrules3.jpg",
  "./gridfull3.jpg",
  "./youwin2.jpg",
  "./youlosegrid.jpg",
  "./king.jpg",
  "./queen.jpg",
  "./jack.jpg",

  // your local audio files in repo root (adjust names if yours differ)
  "./shuffle.mp3",
  "./lose.mp3",
  "./fanfare.mp3",
  "./crowd.mp3",
  "./boing.ogg",
  "./clear.ogg",
  "./lock.mp3",

  // deck back inside /cards
  "./cards/back.png",
];

// Build the list of all 52 card PNGs in ./cards/
function buildDeckAssetList() {
  const suits = ["S", "H", "D", "C"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"];
  const list = [];

  for (const s of suits) {
    for (const v of values) {
      list.push(`./cards/${v}${s}.png`);
    }
  }
  return list;
}

// Cache a list, but NEVER fail the install just because one item 404s.
// (This is the main reason Cache Storage sometimes never appears.)
async function cacheAllSafely(cache, urls) {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) await cache.put(url, res);
      } catch (_) {
        // ignore
      }
    })
  );
  return results;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Cache core + full deck
    const deck = buildDeckAssetList();
    await cacheAllSafely(cache, CORE_ASSETS.concat(deck));

    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // delete older caches
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k.startsWith("darnit-cache-") && k !== CACHE_NAME) ? caches.delete(k) : null));

    await self.clients.claim();
  })());
});

// Cache-first for same-origin requests; network fallback; offline fallback to index.html for navigation
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin (your GitHub Pages site)
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // For page navigations, try network then fall back to cached index.html
    if (req.mode === "navigate") {
      try {
        const fresh = await fetch(req);
        // update cache copy of index
        cache.put("./index.html", fresh.clone()).catch(()=>{});
        return fresh;
      } catch (_) {
        return (await cache.match("./index.html")) || Response.error();
      }
    }

    // For everything else: cache-first
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      // cache successful GETs for future offline use
      if (req.method === "GET" && fresh && fresh.ok) {
        cache.put(req, fresh.clone()).catch(()=>{});
      }
      return fresh;
    } catch (_) {
      return cached || Response.error();
    }
  })());
});
