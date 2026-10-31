/* IQRA VOCAB service worker: instant repeat opens + offline use.
   Place next to index.html. Bump VERSION to force a clean cache after big updates. */
var VERSION='iq-v3';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png'];
var FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){
    return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){});}));
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==VERSION&&k.indexOf('iq-v')===0;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.protocol!=='http:'&&u.protocol!=='https:')return;
  var same=u.origin===self.location.origin;
  var font=FONT_HOSTS.indexOf(u.hostname)>-1;
  if(!same&&!font)return;                       /* Firebase, APIs, auth: never touched */
  if(same&&/firebase-messaging-sw\.js$/.test(u.pathname))return;
  if(font){                                      /* fonts: cache first */
    e.respondWith(caches.match(r).then(function(h){
      return h||fetch(r).then(function(n){var c=n.clone();caches.open(VERSION).then(function(x){x.put(r,c);});return n;});
    }));
    return;
  }
  /* own files: show cached copy at once, refresh it in the background */
  e.respondWith(caches.open(VERSION).then(function(cache){
    return cache.match(r,{ignoreSearch:true}).then(function(hit){
      var net=fetch(r).then(function(n){
        if(n&&n.ok)cache.put(r,n.clone());
        return n;
      }).catch(function(){return hit||(r.mode==='navigate'?cache.match('index.html'):undefined);});
      return hit||net;
    });
  }));
});
