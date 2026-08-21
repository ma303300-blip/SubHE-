// SubHE Service Worker
// קובץ אמיתי (לא blob) — נדרש כדי שאנדרואיד יזהה PWA מלא ויתקין אייקון אמיתי

const CACHE = 'subhe-v3';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // אל תיגע בקריאות API — תמיד מהרשת
  if (e.request.url.includes('api.anthropic.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('fonts.googleapis.com') ||
      e.request.url.includes('accounts.google.com')) {
    return;
  }
  // רשת קודם, מטמון כגיבוי — כדי שעדכונים ייטענו מיד
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
