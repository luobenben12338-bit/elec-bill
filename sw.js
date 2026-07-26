// Service Worker - 电费小账本 PWA 离线支持
const CACHE = 'elec-ledger-v3';
const ASSETS = ['./', './index.html', './manifest.json'];

// 安装：预缓存核心文件
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

// 激活：清理旧缓存，立即接管
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// 请求拦截：只缓存页面和静态资源，API 请求和网络请求永远走网络
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 只处理同源 GET 请求，API 请求和跨域请求直接透传
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }
  // 非页面/静态资源请求透传
  const isPageOrAsset = url.pathname.endsWith('.html') || url.pathname.endsWith('.json') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname === '/' || url.pathname.endsWith('/');
  if (!isPageOrAsset) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
