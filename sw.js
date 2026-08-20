/* Service Worker — cache offline "app shell" + dati locali.
 * Strategia: cache-first per gli asset statici, con aggiornamento in background.
 * Le chiamate a Supabase (rete) NON vengono messe in cache.
 */
var CACHE = "centrifughe-v4";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./config.js",
  "./assets/css/styles.css",
  "./assets/js/data/micronutrients.js",
  "./assets/js/data/ingredients.js",
  "./assets/js/data/recipes.js",
  "./assets/js/lib/storage.js",
  "./assets/js/lib/calc.js",
  "./assets/js/lib/dataProvider.js",
  "./assets/js/app.js",
  "./assets/icons/favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  // Non intercettare le chiamate cross-origin (es. Supabase, Google Fonts): vanno in rete.
  if (url.origin !== self.location.origin) return;

  // Strategia "network-first": quando c'è connessione si prende SEMPRE l'ultima
  // versione (così gli aggiornamenti si vedono subito), con aggiornamento della
  // cache; offline si usa la copia salvata in cache (con fallback su index.html).
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        return cached || caches.match("./index.html");
      });
    })
  );
});
