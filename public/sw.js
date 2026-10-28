// v2: solo se guardan en caché archivos estáticos públicos. Antes se cacheaba TODO (páginas con
// datos personales y respuestas de /api), y sin conexión se podían ver datos de otra cuenta
// que hubiera usado el mismo teléfono.
const CACHE_NAME = "fitmax-v2";
const STATIC = ["/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const esEstatico = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname === "/manifest.json";
  if (!esEstatico) return; // páginas y /api siempre van a la red

  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) {
        const copia = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copia)).catch(() => {});
      }
      return res;
    }))
  );
});
