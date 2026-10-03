const CACHE_NAME = "pingzy-oled-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./style.css?v=8",
  "./script.js",
  "./script.js?v=8",
  "./manifest.json"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) { return cache.add(url).catch(function () {}); }));
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { if (k !== CACHE_NAME) return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(function (c) { c.put(e.request, clone); });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
        return cached || caches.match("./index.html", { ignoreSearch: true });
      });
    })
  );
});