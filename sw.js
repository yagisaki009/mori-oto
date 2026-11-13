/* オフライン用：一度ひらいたら端末に保存して、電波がなくても動くようにする */
var CACHE = 'mori-oto-v1';
var FILES = ['./', 'index.html', 'scene.js', 'mori.jpg', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'sounds/s_11d8f55a.m4a', 'sounds/s_14034884.m4a', 'sounds/s_1564be69.m4a', 'sounds/s_1847791d.m4a', 'sounds/s_1873c08a.m4a', 'sounds/s_2941bf33.m4a', 'sounds/s_2a31bec9.m4a', 'sounds/s_35527de1.m4a', 'sounds/s_42c05c09.m4a', 'sounds/s_4a1f117f.m4a', 'sounds/s_4c33299e.m4a', 'sounds/s_5c0ae35e.m4a', 'sounds/s_5e9dae94.m4a', 'sounds/s_76d8fc38.m4a', 'sounds/s_7c985584.m4a', 'sounds/s_8b5c34c0.m4a', 'sounds/s_8c6cc167.m4a', 'sounds/s_913813e3.m4a', 'sounds/s_962968f2.m4a', 'sounds/s_9d8fe428.m4a', 'sounds/s_a1fb45df.m4a', 'sounds/s_bd13c7e4.m4a', 'sounds/s_c37c2ac9.m4a', 'sounds/s_c7ee6384.m4a', 'sounds/s_ca983c80.m4a', 'sounds/s_d357f797.m4a', 'sounds/s_d512ceed.m4a', 'sounds/s_dfaf316f.m4a', 'sounds/s_e0c4e5da.m4a', 'sounds/s_ebe422e1.m4a', 'sounds/s_fea88e25.m4a', 'sounds/v_kid1.m4a', 'sounds/v_kid2.m4a', 'sounds/v_kid3.m4a', 'sounds/v_kid4.m4a', 'sounds/v_kid5.m4a', 'sounds/v_kid6.m4a', 'sounds/v_sensei1.m4a', 'sounds/v_sensei2.m4a', 'sounds/v_yama.m4a'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    /* 同じサイトのほかのアプリ（電車・まち・がっき）の保存データは消さない。自分の古い版だけ消す */
    var mine = CACHE.replace(/v\d+$/, '');
    return Promise.all(keys.map(function (k) { if (k !== CACHE && k.indexOf(mine) === 0) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* 保存してあるものをすぐ返す（電波が弱くても待たない）。裏で新しい版があれば取っておく */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok && req.url.indexOf(self.location.origin) === 0) c.put(req, res.clone());
        return res;
      });
      if (hit) { net['catch'](function () {}); return hit; }
      return net['catch'](function () { return c.match('index.html'); });
    });
  }));
});
