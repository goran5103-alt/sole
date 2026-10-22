#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sole Komerc — generator sadržaja strana za WordPress (post_content).
Koristi iste funkcije rasporeda kao build.py (makete), pa je sadržaj identičan maketama.
Razlike u odnosu na makete:
  - linkovi su adrese strana (/slug/), slike su iz medijateke poddomena (/wp-content/uploads/...)
  - zaglavlje, podnožje, uvod naslovne i kontakt blok u bočnoj koloni ne ulaze u sadržaj (rade ih tema i opcije teme)
  - kontakt blok u bočnoj koloni i Contact Form 7 su 'slotovi' (data-itx-slot) koje tema popunjava"""
import json, os, re, sys, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build as B

HOST = re.compile(r'(?:https?:)?//sole-komerc\.solekomerc\.co\.rs')
B.rel = lambda frm, to: to
B.fix = lambda u: HOST.sub('', u)
B.page_shell = lambda slug, inner, extra_css='': inner
B.contact_box = lambda slug: '<div class="box dark" data-itx-slot="kontakt"></div>'
E, A = B.E, B.A
D = B.D

def kontakt(slug):
    b = D[slug]['b']
    h3 = b[0][1]
    ps = [x[1] for x in b if x[0] == 'p']
    boxes = ''
    for i in (0, 2):
        lines = ps[i]
        lines_h = B.br(lines)
        for m in re.findall(r'[\w.+-]+@[\w.-]+', lines):
            lines_h = lines_h.replace(E(m), f'<a href="mailto:{A(m)}">{E(m)}</a>')
        boxes += f'<div class="cbox"><p class="lines">{lines_h}</p><p class="hours">{B.br(ps[i + 1])}</p></div>'
    frm = f'<div class="form-wrap"><h3>{E(h3)}</h3><div data-itx-slot="cf7"></div></div>'
    return B.banner(slug, B.title(slug)) + f'<section class="page"><div class="wrap"><div class="contact-grid">{boxes}</div>{frm}</div></section>'

def home(slug):
    return B.home_body(slug)

def content(slug):
    if slug == '/': h = home(slug)
    elif slug == '/ugalj/': h = B.ugalj_page(slug)
    elif slug == '/primena-uglja-u-industriji/': h = B.primena_page(slug)
    elif slug == '/cene/': h = B.cene_page(slug)
    elif slug == '/partneri-lista/': h = B.partneri_page(slug)
    elif slug == '/dokumentacija/': h = B.dok_page(slug)
    elif slug == '/kontakt/': h = kontakt(slug)
    elif slug in ('/stovariste/', '/akcije/'): h = B.simple_page(slug, full=True)
    elif slug == '/transport/': h = B.simple_page(slug)
    else: h = B.product_page(slug)
    h = HOST.sub('', h).replace('&#x27;', "'")           # isti zapis kao posle obrade u pregledaču (uređivač ne sme da menja bajtove)
    h = re.sub(r'<(path|circle|rect|line|polyline|polygon)\b([^>]*?)\s*/>', r'<\1\2></\1>', h)
    return h.strip() + '\n'

if __name__ == '__main__':
    out = os.path.join(B.ROOT, '..', 'sadrzaj')
    os.makedirs(out, exist_ok=True)
    for slug in D:
        name = 'naslovna' if slug == '/' else slug.strip('/')
        open(os.path.join(out, name + '.html'), 'w', encoding='utf-8').write(content(slug))
    print('strana:', len(D))
