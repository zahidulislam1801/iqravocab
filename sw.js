/* IQRA VOCAB service worker: auto-updating, offline-capable.
   Place next to index.html. You no longer need to bump anything by hand:
   - The page (index.html / navigations) is NETWORK-FIRST: every open fetches the newest copy from the server
     (revalidated with the server, so an unchanged file costs almost nothing) and refreshes the offline copy.
     If the network is offline or slower than NET_WAIT ms, the saved copy is shown instead.
   - Other own files (icons, manifest...) are NETWORK-FIRST too, so a changed file is never served stale.
   - Fonts: cache first (they never change).
   - This file itself is never cached by the worker, and the browser re-checks it on every visit,
     so a new deploy is picked up, activated at once (skipWaiting + clients.claim) and old caches are removed.
   Bump VERSION only if you ever want to force-delete every saved file. */
var VERSION='iq-v4';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png'];
var FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];
var NET_WAIT=6000;   /* ms to wait for the network before falling back to the saved copy */

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){
    return Promise.all(CORE.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){});}));
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==VERSION&&k.indexOf('iq-')===0;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});

/* the page can ask a waiting worker to take over at once */
self.addEventListener('message',function(e){if(e.data==='skipWaiting'||(e.data&&e.data.type==='SKIP_WAITING'))self.skipWaiting();});

function timeout(ms){return new Promise(function(_,rej){setTimeout(function(){rej(new Error('slow'));},ms);});}

/* network first, saved copy as the fallback; key = the cache key to read/write the saved copy under */
function networkFirst(r,key,wait){
  return caches.open(VERSION).then(function(cache){
    var net=fetch(r.url,{cache:'no-cache',credentials:'same-origin'}).then(function(n){
      if(n&&n.ok&&n.type!=='opaque')cache.put(key,n.clone()).catch(function(){});
      return n;
    });
    var fast=wait?Promise.race([net,timeout(wait)]):net;
    return fast.catch(function(){
      return cache.match(key,{ignoreSearch:true}).then(function(hit){
        if(hit)return hit;
        return net.catch(function(){return r.mode==='navigate'?cache.match('index.html'):Response.error();});
      });
    });
  });
}

self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.protocol!=='http:'&&u.protocol!=='https:')return;
  var same=u.origin===self.location.origin;
  var font=FONT_HOSTS.indexOf(u.hostname)>-1;
  if(!same&&!font)return;                                   /* Firebase, APIs, auth: never touched */
  if(same&&/(^|\/)(firebase-messaging-sw|sw)\.js$/.test(u.pathname))return;   /* worker scripts: always straight from the network */
  if(font){                                                  /* fonts: cache first */
    e.respondWith(caches.match(r).then(function(h){
      return h||fetch(r).then(function(n){var c=n.clone();caches.open(VERSION).then(function(x){x.put(r,c);});return n;});
    }));
    return;
  }
  if(r.mode==='navigate'){                                   /* the app page: newest copy first, saved copy if offline/slow */
    e.respondWith(networkFirst(r,'index.html',NET_WAIT));
    return;
  }
  e.respondWith(networkFirst(r,r,0));                        /* every other own file */
});
