/* Safety Detective Town — service worker for offline play.
   Everything the game needs comes from this site (Three.js and the fonts are
   bundled in vendor/ and fonts/), so nothing is fetched from other servers.
   - The game page is network-first (so updates arrive when online) with a
     3.5 s timeout, falling back to the cached copy when offline.
   - vendor/ and fonts/ never change at the same address, so they are cache-first.
   - Other files from this site (icons, manifest, future audio/ voice files)
     are served from cache and quietly refreshed in the background.
   - When the page asks (on resume) or a slow load fell back to the cache, a
     newer index.html is stored and open pages get {type:'update-ready'}.
   Bump CACHE_VERSION only to force everything to be fetched again. */
const CACHE_VERSION = 'v2';
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
  './vendor/three/three.module.min.js',
  './fonts/baloo2-latin.woff2',
  './fonts/baloothambi2-tamil.woff2',
  './fonts/baloothambi2-latin.woff2',
];
const IMMUTABLE_DIRS = ['vendor/', 'fonts/'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

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
  if (url.origin !== self.location.origin) return; // the game loads nothing from other sites
  const scope = new URL(self.registration.scope).pathname;
  const rel = url.pathname.startsWith(scope) ? url.pathname.slice(scope.length) : url.pathname;
  event.respondWith(IMMUTABLE_DIRS.some(d => rel.startsWith(d)) ? cacheFirst(req) : staleWhileRevalidate(req));
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
