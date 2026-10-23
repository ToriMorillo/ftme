// ftMe's service worker (Oct 23, 2026): the rope's push notifications, on
// the web and in the iPhone Home Screen app (iOS 16.4 and later). It keeps
// nothing and caches nothing: ftMe loads as before.
'use strict';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// A push from the rope's server: { title, body, tag, open }.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { title: event.data ? event.data.text() : 'ftMe' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'ftMe', {
      body: data.body || '',
      // The same tag as the app's own notice for it, so it shows once.
      tag: data.tag || 'rope',
      icon: 'icons/Icon-192.png',
      badge: 'icons/Icon-192.png',
      data: { open: data.open || 'rope' },
    }),
  );
});

// A tap opens ftMe on what it's about (the Rope tab).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const open = (event.notification.data && event.notification.data.open) || 'rope';
  const url = new URL('./?open=' + encodeURIComponent(open), self.registration.scope).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const w of windows) {
        if ('navigate' in w) {
          await w.navigate(url);
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    })(),
  );
});
