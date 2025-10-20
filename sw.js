// sw.js (Service Worker)

// Название кэша и файлы, которые нужно сохранить
const CACHE_NAME = 'match3-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/js/main.js',
  '/js/board.js',
  '/js/config.js',
  '/js/gamestate.js',
  '/js/input.js',
  '/js/renderer.js',
  '/js/utils.js'
  // НЕ кэшируй иконки, если они будут меняться.
  // Но для оффлайн-запуска они понадобятся.
  // '/assets/icons/icon-192x192.png',
  // '/assets/icons/icon-512x512.png'
];

// 1. Установка Service Worker (Кэширование ассетов)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Кэширование ассетов');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => console.error('SW: Ошибка кэширования', err))
  );
  self.skipWaiting();
});

// 2. Активация Service Worker (Очистка старых кэшей)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Очистка старого кэша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch (Отдача из кэша или запрос к сети)
// Это ОБЯЗАТЕЛЬНАЯ часть. Без нее PWA не сработает.
self.addEventListener('fetch', (event) => {
  // Мы используем стратегию "Cache first" (сначала кэш)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если ресурс есть в кэше - отдаем его
        if (response) {
          return response;
        }
        // Если нет - идем в сеть
        return fetch(event.request);
      })
  );
});
