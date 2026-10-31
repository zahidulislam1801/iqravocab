/* Cloudflare build for iqraquiz.pages.dev: replaces index.html with a tiny page that holds only the quiz player,
   so the 17 MB vocabulary app and its data are NOT published on the quiz site. Run: node build_quiz.js */
var fs=require('fs');
var s=fs.readFileSync('index.html','utf8');
var a=s.indexOf('<script id="iq-quizkit">');
if(a<0){console.error('Quiz kit not found in index.html - build stopped.');process.exit(1);}
a+='<script id="iq-quizkit">'.length;
var b=s.indexOf('</script>',a);
var js=s.slice(a,b);
fs.writeFileSync('index.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IQRA Quiz</title><script>'+js+'</script></head><body></body></html>');
console.log('Quiz site page written ('+js.length+' bytes).');
