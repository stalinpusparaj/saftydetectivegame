/* Safety Detective Town — service worker for offline play.
   - The game page is network-first (so updates arrive when online) with a
     3.5 s timeout, falling back to the cached copy when offline.
   - Three.js and Google Fonts are pinned, so they are cache-first.
   - Other files from this site (icons, manifest, future audio/ voice files)
     are served from cache and quietly refreshed in the background.
   - When the page asks (on resume) or a slow load fell back to the cache, a
     newer index.html is stored and open pages get {type:'update-ready'}.
   Bump CACHE_VERSION only to force everything to be fetched again. */
const CACHE_VERSION = 'v1';
const CACHE = `sdt-${CACHE_VERSION}`;

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon-32.png',
  './favicon-192.png',
  './apple-touch-icon.png',
  './icon-512.png',
  './icon-maskable-512.png',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Baloo+Thambi+2:wght@500;700;800&display=swap';
const PINNED_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    // Fonts are best effort: the game still works with system fonts.
    try { await cacheFonts(cache); } catch (e) { /* retried at runtime */ }
    await self.skipWaiting();
  })());
});

/* Cache the font stylesheet plus the Latin and Tamil font files it points to. */
async function cacheFonts(cache) {
  const res = await fetch(FONT_CSS, { mode: 'cors' });
  if (!res.ok) return;
  const css = await res.clone().text();
  await cache.put(FONT_CSS, res);
  const urls = [];
  const blocks = css.split('/*').slice(1);
  for (const b of blocks) {
    const subset = b.slice(0, b.indexOf('*/')).trim();
    if (subset !== 'latin' && subset !== 'tamil') continue;
    const m = b.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (m) urls.push(m[1]);
  }
  if (!urls.length) urls.push(...[...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(m => m[1]));
  await Promise.all(urls.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && cache.put(u, r)).catch(() => {})));
}

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('sdt-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || req.headers.has('range')) return; // media range requests go straight to the network
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    // only the game itself is the game page; other pages (e.g. privacy.html) keep their own cache entry
    const scope = new URL(self.registration.scope).pathname;
    const isGame = url.pathname === scope || url.pathname === scope + 'index.html';
    event.respondWith(isGame ? pageNetworkFirst(req) : otherPage(req));
    return;
  }
  if (PINNED_HOSTS.includes(url.hostname)) { event.respondWith(cacheFirst(req)); return; }
  if (url.origin === self.location.origin) { event.respondWith(staleWhileRevalidate(req)); return; }
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'check-update') event.waitUntil(checkForUpdate());
});

async function checkForUpdate() {
  try {
    const res = await fetch('./index.html', { cache: 'no-cache' });
    if (res.status === 200) await storeIfChanged(await caches.open(CACHE), res);
  } catch (e) { /* offline: nothing to do */ }
}

/* Keep the newest page; if it differs from the copy we had, tell open pages. */
async function storeIfChanged(cache, res) {
  const fresh = await res.clone().text();
  const old = await cache.match('./index.html');
  const oldText = old ? await old.text() : null;
  if (oldText === fresh) return;
  await cache.put('./index.html', res);
  if (oldText === null) return;
  for (const c of await self.clients.matchAll({ type: 'window' })) c.postMessage({ type: 'update-ready' });
}

async function pageNetworkFirst(req) {
  const cache = await caches.open(CACHE);
  let servedFromCache = false;
  const network = fetch(req).then(async res => {
    if (res.status === 200) {
      // the page received the cached copy: if this one is newer, offer the update
      if (servedFromCache) await storeIfChanged(cache, res.clone()).catch(() => {});
      else await cache.put('./index.html', res.clone()).catch(() => {});
    }
    return res;
  });
  try {
    const res = await Promise.race([network, new Promise((_, no) => setTimeout(() => no(new Error('slow')), 3500))]);
    if (res.ok) return res;
    throw new Error('bad status');
  } catch (e) {
    servedFromCache = true;
    network.catch(() => {}); // a slow response still refreshes the cache when it lands
    return (await cache.match('./index.html')) || (await cache.match('./')) || network;
  }
}

async function otherPage(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res.status === 200) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch (e) {
    return (await cache.match(req, { ignoreSearch: true })) || Response.error();
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.status === 200 || res.type === 'opaque') cache.put(req, res.clone()).catch(() => {});
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, { ignoreSearch: true });
  const network = fetch(req).then(res => { if (res.status === 200) cache.put(req, res.clone()).catch(() => {}); return res; });
  if (hit) { network.catch(() => {}); return hit; }
  return network;
}
