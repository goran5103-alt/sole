#!/usr/bin/env python3
# Straža teksta po strani: izvor = tekst te strane sa živog sajta + zajednički delovi (zaglavlje, meni, kontakt)
import sys, os, json, html, importlib.util
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location('st', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tekst-straza.py')); st = importlib.util.module_from_spec(spec); spec.loader.exec_module(st)
import build as B
D = B.D
E = lambda s: html.escape(s)
def src_html(slug):
    out = [f'<title>{E(B.D[slug]["title"] + " – SOLE KOMERC" if slug != "/" else "SOLE KOMERC – " + B.TAGLINE)}</title>']
    for x in D[slug]['b']:
        if x[0] == 'img': out.append(f'<img alt="{E(x[2])}">')
        elif x[0] == 'form': out += [f'<input placeholder="{E(v)}">' for v in x[1:5]] + [f'<button>{E(x[5])}</button>']
        else: out.append('<p>' + '<br>'.join(E(l) for l in x[1].split('\n')) + '</p>')
    return '\n'.join(out)
CHROME = [B.TAGLINE, B.ADDR, B.PHONE, B.LOGO_ALT, B.BRAND] + [l for _, l in B.TOP] + [D[s]['title'] for s in D]
CHROME += [x[1] for x in D['/kontakt/']['b'] if x[0] == 'p']
ALL = set()
for s in D:
    for x in D[s]['b']:
        if x[0] in ('p','t','li','h1','h2','h3'):
            for part in [x[1]] + x[1].split('\n'): ALL.add(st.sredi(part))
        if x[0] == 'img': ALL.add(st.sredi(x[2]))
tot = 0; rep = []
for slug in D:
    sada = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'makete', '' if slug == '/' else slug.strip('/'), 'index.html')
    izvor = set(st.sredi(t) for t, _ in st.Citac() and [])
    c = st.Citac(); c.feed(src_html(slug)); c.close()
    own = set(st.sredi(t) for t, _ in c.komadi)
    chrome = set(st.sredi(t) for t in CHROME)
    izv = own | chrome
    spoj = '\n'.join(izv)
    now = st.pokupi(sada)
    seen = set(); novo = []; sa_druge = []; skr = []
    for f in now:
        for t, l in now[f]:
            s = st.sredi(t)
            if len(s) < 3: continue
            seen.add(s)
            if s in izv: continue
            if s in ALL: sa_druge.append(s)
            elif s in spoj: skr.append(s)
            else: novo.append(s)
    izb = sorted(t for t in own if len(t) >= 3 and t not in seen and not any(t in v for v in seen))
    n = len(novo) + len(skr) + len(izb)
    tot += n
    rep.append((slug, novo, skr, izb, sorted(set(sa_druge))))
for slug, novo, skr, izb, sd in rep:
    flag = 'OK ' if not (novo or skr or izb) else 'NALAZ'
    print(f'{flag:5} {slug}  novo={len(novo)} skraceno={len(skr)} izbaceno={len(izb)}  (preneto sa druge strane: {len(sd)})')
    for k, L in (('NOVO', novo), ('SKRACENO', skr), ('IZBACENO', izb)):
        for s in L: print(f'      {k}: {s}')
print('UKUPNO NALAZA:', tot)
