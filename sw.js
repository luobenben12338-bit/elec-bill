// Service Worker - 电费小账本 PWA 离线支持
const CACHE = 'elec-ledger-v1.0.0';
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
const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');
const isAsset = url.pathname.endsWith('.json') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
if (!isHTML && !isAsset) {
return;
}
// HTML 页面：网络优先，确保用户拿到最新内容；离线时回退缓存
if (isHTML) {
e.respondWith(
fetch(e.request).then(response => {
if (response && response.status === 200) {
const clone = response.clone();
caches.open(CACHE).then(c => c.put(e.request, clone));
}
return response;
}).catch(() => caches.match(e.request).then(cached => cached || caches.match('./index.html')))
);
return;
}
// 静态资源：缓存优先，后台更新
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
