const CACHE_STATIC = 'controle-viagem-static-v1';
const CACHE_ASSETS = [
  './', './index.html', './manifest.json', './style/style.css',
  './js/db.js', './js/app.js', './js/veiculo.js', './js/viagem.js',
  './js/abastecimento.js', './js/custo.js', './js/relatorio.js',
  './img/logo.png'
];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE_STATIC).then(cache => cache.addAll(CACHE_ASSETS)))
);

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});