const CACHE_NAME = "darnit-offline-v1";

function allCardUrls(){
  const ranks = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"];
  const suits = ["S","H","D","C"];
  const urls = [];
  for(const r of ranks){
    for(const s of suits){
      urls.push(`cards/${r}${s}.png`);
    }
  }
  return urls;
}

const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",

  "./img/darnitlogo.jpg",
  "./img/darnitrules.jpg",
  "./img/gridfull3.jpg",
  "./img/youlosegrid.jpg",
  "./img/king.jpg",
  "./img/queen.jpg",
  "./img/jack.jpg",
  "./img/youwin2.jpg",

  "./sounds/shuffle.mp3",
  "./sounds/clear.ogg",
  "./sounds/boing.ogg",
  "./sounds/lock.ogg",
  "./sounds/lose.mp3",
  "./sounds/fanfare.mp3",
  "./sounds/crowd.mp3",

  "./cards/back.png",
  ...allCardUrls(),
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if(cached) return cached;

    const res = await fetch(event.request);
    cache.put(event.request, res.clone());
    return res;
  })());
});
