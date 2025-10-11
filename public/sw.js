// Placeholder Service Worker for PWA
// This is a minimal service worker for demonstration purposes
// In production, you would use workbox or next-pwa for proper caching strategies

const CACHE_NAME = 'carreviews-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  // In production, you would implement caching strategies here
  event.respondWith(fetch(event.request));
});

