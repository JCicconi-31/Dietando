const CACHE_NAME = "diet-organizer-v4";
const PRECACHE_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon.svg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch {
          // Precache tollerante per non bloccare l'installazione
        }
      }
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Ignora le richieste non-GET
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Non intercettare route API, HMR di sviluppo o WebSocket
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("_next/webpack-hmr") ||
    url.protocol === "ws:" ||
    url.protocol === "wss:"
  ) {
    return;
  }

  // 1. Per navigazione di pagine (HTML): Network-First con fallback HTML garantito (MAI undefined né 503)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = (await caches.match(event.request)) || (await caches.match("/"));
          if (cached) return cached;

          // Fallback HTML elegante se la connessione fallisce
          return new Response(
            `<!DOCTYPE html>
            <html lang="it">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Organizzatore Dieta - Offline</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #121214; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; box-sizing: border-box; }
                .card { max-width: 360px; padding: 28px 24px; background: #1a1a1f; border-radius: 24px; border: 1px solid #2a2a30; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .icon { width: 52px; height: 52px; background: rgba(247,147,30,0.15); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; }
                h1 { font-size: 1.15rem; font-weight: 800; margin: 0 0 8px; color: #f5f5f4; }
                p { font-size: 0.85rem; color: #a8a29e; line-height: 1.5; margin: 0 0 20px; }
                button { width: 100%; padding: 12px; background: linear-gradient(135deg, #ea580c, #F7931E); color: white; border: none; border-radius: 14px; font-weight: bold; font-size: 0.9rem; cursor: pointer; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="icon">📶</div>
                <h1>Connessione non disponibile</h1>
                <p>Verifica la tua connessione internet e tocca il pulsante qui sotto per ricaricare la pagina.</p>
                <button onclick="window.location.reload()">Ricarica Pagina</button>
              </div>
            </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html; charset=utf-8" },
              status: 200,
            }
          );
        })
    );
    return;
  }

  // 2. Per risorse statiche: Stale-While-Revalidate sicuro
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Se in cache, restituisci subito e aggiorna in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Se non in cache, preleva dalla rete e salva in cache
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
