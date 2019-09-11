let ver = 'v1::';

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cache => {
            let fresh = fetch(e.request)
                .then(fetchAndUpdate, failedResponse)
                .catch(failedResponse);

            return fresh || cache;

            function fetchAndUpdate(res) {
                if (e.request.url.indexOf('socket.io') > -1) {
                    return res;
                }

                let copy = res.clone();
                caches.open(ver + 'app').then(cache => {
                    cache.put(e.request, copy);
                });

                return res;
            }

            function failedResponse() {
                if (e.request.url.indexOf('socket.io') > -1) {
                    return new Response('let io = (function() { return false })');
                }
                return new Response('');
            }
        })
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches
            .keys()
            .then(keys => {
                console.log('these are my keys', keys);
                return Promise.all(
                    keys.filter(key => !key.startsWith(ver)).map(key => caches.delete(key))
                );
            })
            .then(() => console.log('cleared out cache'))
    );
});
