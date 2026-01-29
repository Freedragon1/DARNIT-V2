/* sw.js */
const CACHE_NAME = "darnit-v2-cache-1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  // UI images
  "./darnitlogo.jpg",
  "./darnitrules.jpg",
  "./gridfull3.jpg",
  "./youlosegrid.jpg",
  "./youwin2.jpg",
  "./king.jpg",
  "./queen.jpg",
  "./jack.jpg",

  // Sounds (update names to match your repo exactly)
  "./shuffle.mp3",
  "./lose.mp3",
  "./fanfare.mp3",
  "./crowd.mp3",
  "./lock.mp3",
  "./clear.ogg",
  "./boing.ogg",

  // Cards folder (IMPORTANT: you must list all 53 files you use)
  "./cards/back.png",

  // Examples – you must include all card pngs present:
  "./cards/AS.png",
  "./cards/2S.png",
  "./cards/3S.png",
  "./cards/4S.png",
  "./cards/5S.png",
  "./cards/6S.png",
  "./cards/7S.png",
  "./cards/8S.png",
  "./cards/9S.png",
  "./cards/0S.png",
  "./cards/JS.png",
  "./cards/QS.png",
  "./cards/KS.png",

  "./cards/AH.png",
  "./cards/2H.png",
  "./cards/3H.png",
  "./cards/4H.png",
  "./cards/5H.png",
  "./cards/6H.png",
  "./cards/7H.png",
  "./cards/8H.png",
  "./cards/9H.png",
  "./cards/0H.png",
  "./cards/JH.png",
  "./cards/QH.png",
  "./cards/KH.png",

  "./cards/AD.png",
  "./cards/2D.png",
  "./cards/3D.png",
  "./cards/4D.png",
  "./cards/5D.png",
  "./cards/6D.png",
  "./cards/7D.png",
  "./cards/8D.png",
  "./cards/9D.png",
  "./cards/0D.png",
  "./cards/JD.png",
  "./cards/QD.png",
  "./cards/KD.png",

  "./cards/AC.png",
  "./cards/2C.png",
  "./cards/3C.png",
  "./cards/4C.png",
  "./cards/5C.png",
  "./cards/6C.png",
  "./cards/7C.png",
  "./cards/8C.png",
  "./cards/9C.png",
  "./cards/0C.png",
  "./cards/JC.png",
  "./cards/QC.png",
  "./cards/KC.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
