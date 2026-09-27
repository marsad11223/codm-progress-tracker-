const CACHE = "camo-command-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response("Camo Command needs the tracker running on your computer.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          }),
      ),
    );
    return;
  }

  const cacheable =
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/weapons/") ||
    url.pathname === "/favicon.ico";
  if (!cacheable) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }),
  );
});
