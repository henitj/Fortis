/*
 * FORTIS offline support.
 * - Pages: network-first, falling back to the cached copy when offline.
 * - Hashed build assets (/_next/static): cache-first (they never change).
 * Only same-origin GET requests are handled. Nothing is sent anywhere.
 */
const CACHE = "fortis-offline-v1";
const PAGES = ["/", "/setup", "/plan"];
const ASSET_RE = /\/_next\/static\/[^"'\s)\\]+/g;

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set();
  for (const path of PAGES) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;
      const html = await res.clone().text();
      for (const m of html.matchAll(ASSET_RE)) assets.add(m[0]);
      await cache.put(path, res);
    } catch {
      /* offline during install — runtime caching will fill in later */
    }
  }
  await Promise.all(
    [...assets, "/icon.svg"].map((url) =>
      cache.match(url).then((hit) => hit || cache.add(url).catch(() => undefined)),
    ),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && PAGES.includes(url.pathname)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(url.pathname)) || (await caches.match("/")) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/icon.svg") {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
  }
});
