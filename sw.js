const CACHE_NAME = "darnit-v2-001";

/* Build the full pack URLs based on your naming scheme */
function buildCardUrls(){
  const suits = ["S","H","D","C"];
  const vals  = ["A","2","3","4","5","6","7","8","9","0","J","Q","K"]; // 10 is 0
  const urls = ["cards/back.png"];
  for (const s of suits){
    for (const v of vals){
      urls.push(`cards/${v}${s}.png`);
    }
  }
  return urls;
}

const CORE_ASSETS = [
  "./",
  "index.html",
  "manifest.json",
  "sw.js",

  // UI images
  "darnitlogo.jpg",
  "darnitrules3.jpg",   // change to darnitrules.jpg if that’s your file
  "gridfull3.jpg",
  "youlosegrid.jpg",
  "youwin2.jpg",
  "king.jpg",
  "queen.jpg",
  "jack.jpg",

  // sounds
  "shuffle.mp3",
  "lose.mp3",
  "lock.mp3",
  "fanfare.mp3",
  "crowd.mp3",
  "boing.ogg",
  "clear.ogg",

  ...buildCardUrls()
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
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

/* Cache-first for same-origin files (instant offline) */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // only handle GET
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try{
      const fresh = await fetch(req);
      // store a copy for later
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
      return fresh;
    }catch(e){
      // fallback: if navigation offline, serve index
      if (req.mode === "navigate") {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match("index.html")) || Response.error();
      }
      return Response.error();
    }
  })());
});
