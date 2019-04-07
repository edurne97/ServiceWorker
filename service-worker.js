'use strict'

var cacheVersion = 1;
var currentCache = {
    offline: 'offline-cache' + cacheVersion
};
const offlineUrl = './offline-juego.html';
const recursos = [
    offlineUrl,
    './juego.js'
];

function createCacheBustedRequest(url) {
    let request = new Request(url, {
        cache: 'reload'
    });

    if ('cache' in request) {
        return request;
    }

    let bustedUrl = new URL(url, self.location.href);
    bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
    return new Request(bustedUrl);
}

this.addEventListener('install', event => {
    event.waitUntil(
        caches.open(currentCache.offline)
        .then(cache => {
            return cache.addAll(recursos);
        })
    );
});

this.addEventListener('fetch', event => {
    // request.mode = navigate isn't supported in all browsers
    // so include a check for Accept: text/html header.
    if (event.request.mode === 'navigate' ||
        (event.request.method === 'GET' &&
            event.request.headers.get('accept').includes('text/html'))) {
	var cacheBustedRequest = createCacheBustedRequest(event.request.url);
	event.respondWith(
	    fetch(cacheBustedRequest).catch(error => {
                // Return the offline page
                return caches.match(offlineUrl);
            })
        );
    } else {
        // Respond with everything else if we can
        event.respondWith(caches.match(event.request)
            .then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});


