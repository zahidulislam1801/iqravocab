#!/usr/bin/env python3
"""Split folder data out of a single-file index.html into data/*.js (one file per folder group).
Usage: python3 split.py [single_index.html] [output_dir]   (defaults: index.full.html -> .)
WARNING: overwrites index.html and data/ in the output dir."""
import re, sys, os, json
SRC = sys.argv[1] if len(sys.argv) > 1 else 'index.full.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
# data file name -> [(app id used inside the app, what it is), ...]
GROUPS = {
 'word-smart-1-and-2': [('data','Word Smart 1 - words'),('data2','Word Smart 2 - words'),
                        ('ws1ctx','Word Smart 1 - Bangla context passages'),('ws2ctx','Word Smart 2 - Bangla context passages')],
 'magoosh-1000-and-manhattan-500': [('data5','Magoosh 1000 - words'),('data6','Manhattan 500 - words'),
                        ('mgctx','Magoosh - context passages'),('mgn-data','Magoosh Confusing words - notes'),('mnn-data','Manhattan 500 - notes')],
 'q-bank': [('data4','Q. Bank (IBA) - words'),('rex-data','Q. Bank - Synonym/Antonym questions'),('rex-data2','Q. Bank - Uni. Ad. Ques.')],
 '501-sentence-completion': [('sc5-data','501 Sentence Completion - GRE-style module'),('sc501-data','501 Sentence Completion - practice module')],
 'barrons-800-and-333': [('data7',"Barron's 800 - words"),('data3',"Barron's 333 - words"),('gre333ctx',"Barron's 333 (GRE 333) - context passages")],
 'barrons-1100': [('bdata',"Barron's 1100 - words and days"),('bx-data','Extra example sentences and word forms')],
 'gre-analogy': [('gra-data','GRE Analogy - questions')],
}
ID2G = {i: (g, desc) for g, items in GROUPS.items() for i, desc in items}
PAT = re.compile(rb'<script type="application/json" id="([^"]+)">(.*?)</script>', re.S)
d = open(SRC, 'rb').read()
os.makedirs(os.path.join(OUT, 'data'), exist_ok=True)
bodies = {g: {} for g in GROUPS}; seen = set()
def rep(m):
    i = m.group(1).decode()
    if i not in ID2G: return m.group(0)
    g = ID2G[i][0]; bodies[g][i] = m.group(2).decode('utf8')
    if g in seen: return ('<!--iqra:%s-->' % i).encode()
    seen.add(g); return ('<script src="data/%s.js"></script>' % g).encode()
out = PAT.sub(rep, d)
for g, items in GROUPS.items():
    parts = ['/* IQRA data file: %s */\n' % g]
    desc_of = dict(items)
    for i in bodies[g]:
        desc = desc_of[i]
        if True:
            parts.append("/* %s  (app id: %s) */\n(function(){var s=document.createElement('script');s.type='application/json';s.id=%s;s.textContent=%s;document.head.appendChild(s);})();\n"
                         % (desc, i, json.dumps(i), json.dumps(bodies[g][i], ensure_ascii=False)))
    open(os.path.join(OUT, 'data', g + '.js'), 'wb').write(''.join(parts).encode('utf8'))
open(os.path.join(OUT, 'index.html'), 'wb').write(out)
print('index.html = %.2f MB, %d data files' % (len(out) / 1048576, len(GROUPS)))
