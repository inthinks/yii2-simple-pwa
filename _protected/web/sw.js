var cacheName = 'hello-world-page';
var filesToCache = [
 '/',
 '/css/site.css'
];
self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open(cacheName).then(function(cache) {
     return cache.addAll(filesToCache);
   })
 );
});


self.addEventListener('activate',  event => {
 event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', event => {
 event.respondWith(
   caches.match(event.request).
then(response => {
     return response || fetch(event.request);
   })
 );
});



