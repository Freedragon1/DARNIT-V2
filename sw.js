/* Darnit2 Service Worker: offline + instant start */

const CACHE_NAME = "darnit2-cache-v1";

// Build 52 card filenames programmatically (AS..KS, 0H etc)
const VALUES = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"]; // 10 is "0"
const SUITS  = ["S","H","D","C"];

function buildCardList(){
  const out = [];
  for(const s of SUITS){
    for(const v of VALUES){
      out.push(`cards/${v}${s}.png`);
    }
  }
  out.push("cards/back.png");
  return out;
}

const ASSETS = [
  "./",
  "index.html",
  "manifest.json",

  // images
  "img/darnitlogo.jpg",
  "img/darnitrules.jpg",
  "img/gridfull3.jpg",
  "img/youlosegrid.jpg",
  "img/king.jpg",
  "img/queen.jpg",
  "img/jack.jpg",
  "img/youwin2.jpg",

  // sounds
  "sfx/shuffle.mp3",
  "sfx/clear.ogg",
  "sfx/boing.ogg",
  "sfx/lock.ogg",
  "sfx/lose.mp3",
  "sfx/fanfare.mp3",
  "sfx/crowd.mp3",

  // icons (adjust if your filenames differ)
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-180.png",
  "icons/icon-167.png",
  "icons/icon-152.png",
  "icons/icon-120.png",
  "icons/icon-76.png",
  "icons/icon-60.png",
].concat(buildCardList());

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Cache-first for instant offline
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if(req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if(cached) return cached;
      return fetch(req).then((res) => {
        // Save a copy for future offline runs
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => {
        // fallback (if index cached, it will be returned by match above)
        return cached;
      });
    })
  );
});
