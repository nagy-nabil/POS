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

const assetsIWantSaved = new Set([
  "document",
  "font",
  "image",
  "script",
  "style",
]);
const cacheName = "pwav1";

self.addEventListener("install", (event) => {
  const withInstall = async () => {
    const cache = await caches.open(cacheName);
    const assets = [
      // list of assets to cache
      "/",
    ];
    await cache.addAll(assets);
  };
  console.log("installing");
  event.waitUntil(withInstall());
});

self.addEventListener("fetch", (event) => {
  const f = async () => {
    const cache = await caches.open(cacheName);
    let res = await cache.match(event.request.url);
    if (res === undefined && assetsIWantSaved.has(event.request.destination)) {
      console.log(
        "found assets for the first time with url",
        event.request.url
      );
      console.log("cache deez nutz");
      await cache.add(event.request.url);
    }
    return res !== undefined ? res : fetch(event.request);
  };

  event.respondWith(f());
});
