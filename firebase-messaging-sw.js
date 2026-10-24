/* IQRA Vocab - push notifications for admin notices.
   Put this file in the SAME folder as index.html (same level as sw.js). */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDNgKIh4CYkbCMbbvsyhb0aCPG4fsSAixs",
  authDomain: "iqravocab-c3e63.firebaseapp.com",
  projectId: "iqravocab-c3e63",
  storageBucket: "iqravocab-c3e63.firebasestorage.app",
  messagingSenderId: "1058920337301",
  appId: "1:1058920337301:web:b60a671fedd24fa041309c"
});
const messaging = firebase.messaging();

/* The server sends data-only messages; we show the notification ourselves. */
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const title = d.title || 'IQRA Vocab';
  return self.registration.showNotification(title, {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.id || 'iqra-notice',
    renotify: true,
    data: { url: d.url || './' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope.replace('firebase-cloud-messaging-push-scope', '')).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return clients.openWindow(target);
    })
  );
});
