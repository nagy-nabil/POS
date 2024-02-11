// @ts-nocheck
/**
 * The destination read-only property of the Request interface returns a string describing the type of content being requested.
 ** The string must be one of the audio, audioworklet, document, embed, font, frame, iframe,
 ** image, manifest, object, paintworklet, report, script, sharedworker, style, track,
 ** video, worker or xslt strings, or the empty string, which is the default value.
 */

/**
 ** what does the "" string point to?
 * ""
 * The default value of destination is used for destinations that do not have their own
 * value. navigator.sendBeacon(), EventSource, <a ping>, <area ping>, fetch(),
 * XMLHttpRequest, WebSocket, Cache and more.
 */

const cacheFirstAssets = new Set([
  "document",
  "font",
  "image",
  "script",
  "style",
]);
const cacheName = "pwav1";
// eslint-disable-next-line
const APP_VERSION = "0.1.15";

async function updateCache(req, res) {
  const cache = await caches.open(cacheName);
  cache.put(req, res.clone());
}

async function cacheFirst(request) {
  const cache = await caches.open(cacheName);
  let cacheRes = await cache.match(request.url);
  if (cacheRes !== undefined) {
    return cacheRes;
  }
  // not found in the cache , fetch from network then cache them
  const networkRes = await fetch(request);
  // not waiting because we don't want the main thread to be holded to the cache
  updateCache(request, networkRes.clone());
  return networkRes;
}

self.addEventListener("install", (event) => {
  const withInstall = async () => {
    // delete old cache first if exists
    await caches.delete(cacheName);
    // const cache = await caches.open(cacheName);
    // const assets = [
    //   // list of assets to cache
    //   "/",
    // ];
    // await cache.addAll(assets);
  };
  event.waitUntil(withInstall());
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (cacheFirstAssets.has(event.request.destination)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    event.respondWith(fetch(event.request));
  }
});
