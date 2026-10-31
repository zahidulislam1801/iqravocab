#!/usr/bin/env python3
"""Merge data/*.js back into one single-file page (inverse of split.py). Safe: only creates a new file.
Usage: python3 merge.py [index.html] [output.html]   (defaults: index.html -> index.full.html)"""
import re, sys, os, json
SRC = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
DST = sys.argv[2] if len(sys.argv) > 2 else 'index.full.html'
base = os.path.dirname(os.path.abspath(SRC))
BLK = re.compile(r's\.id=("(?:[^"\\]|\\.)*");s\.textContent=("(?:[^"\\]|\\.)*");document\.head')
bodies, first = {}, {}
dd = os.path.join(base, 'data')
for fn in sorted(os.listdir(dd)):
    if not fn.endswith('.js'): continue
    t = open(os.path.join(dd, fn), 'rb').read().decode('utf8')
    for k, m in enumerate(BLK.finditer(t)):
        i = json.loads(m.group(1)); bodies[i] = json.loads(m.group(2))
        if k == 0: first[fn[:-3]] = i
def blk(i): return b'<script type="application/json" id="' + i.encode() + b'">' + bodies[i].encode('utf8') + b'</script>'
d = open(SRC, 'rb').read()
d = re.sub(rb'<script src="data/([^"/]+)\.js"></script>', lambda m: blk(first[m.group(1).decode()]), d)
d = re.sub(rb'<!--iqra:([^>]+)-->', lambda m: blk(m.group(1).decode()), d)
open(DST, 'wb').write(d)
print('merged -> %s (%.2f MB)' % (DST, len(d) / 1048576))
