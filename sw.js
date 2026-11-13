/* Service worker cangkang PWA LHP Pabrik Teh.
   Hanya menyimpan cangkang (halaman ini, manifest, ikon). Data aplikasi Apps Script TIDAK disimpan,
   dan permintaan ke alamat lain (script.google.com) tidak disentuh sama sekali.
   Setiap kali file cangkang diubah, NAIKKAN angka VERSI agar pengguna menerima pembaruan. */
var VERSI = 'lhp-pwa-v1';
var CANGKANG = ['./', 'index.html', 'manifest.webmanifest', 'offline.html',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-48.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(CANGKANG); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin !== self.location.origin) return;          /* jangan ikut campur ke Apps Script / Google */
  if (r.mode === 'navigate') {                            /* halaman: jaringan dulu agar selalu terbaru, cadangan dari simpanan */
    e.respondWith(fetch(r).then(function (res) {
      var salin = res.clone(); caches.open(VERSI).then(function (c) { c.put('index.html', salin); });
      return res;
    }).catch(function () {
      return caches.match('index.html').then(function (x) { return x || caches.match('offline.html'); });
    }));
    return;
  }
  e.respondWith(caches.match(r).then(function (x) {       /* ikon & manifest: simpanan dulu */
    return x || fetch(r).then(function (res) {
      var salin = res.clone(); caches.open(VERSI).then(function (c) { c.put(r, salin); });
      return res;
    });
  }));
});
