self.addEventListener("install", event => {
    event.waitUntil(
        caches.open('static-assets')
            .then(cache => cache.addAll([
                '/index.html',
                '/assets/js/',
                '/assets/css/',
                '/assets/images/',
            ].map(path => {
                return fetch(path)
                    .then(response => response.url)
                    .then(url => {
                        return cache.add(url);
                    })
            })
        ))
    )
})