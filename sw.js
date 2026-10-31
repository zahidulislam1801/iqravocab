/* IQRA VOCAB service worker: instant repeat opens + offline use.
   Place next to index.html. Bump VERSION to force a clean cache after big updates. */
var VERSION='iq-v2';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png',
  'data/word-smart-1-and-2.js','data/magoosh-1000-and-manhattan-500.js','data/q-bank.js',
  'data/501-sentence-completion.js','data/barrons-800-and-333.js','data/barrons-1100.js','data/gre-analogy.js'];
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
