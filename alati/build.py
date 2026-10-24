#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sole Komerc — generator HTML maketa.
Sav tekst dolazi iz data/sve.json (doslovno preuzeto sa živog sajta, provereno otiskom).
Ovaj fajl NE sadrži tekst sadržaja — samo raspored."""
import json, os, re, html, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(ROOT, '..', 'podaci', 'sve.json'), encoding='utf-8'))
OUT = os.path.join(ROOT, '..', 'makete')

# ---- tekst iz zaglavlja originala (doslovno) ----
TAGLINE = 'DOBRODOŠLI NA PREZENTACIJU PREDUZEĆA SOLE KOMERC D.O.O. BEOGRAD'
ADDR = 'Maršala Tita 225, 11272 Dobanovci'
PHONE = '+381 11 3617 289'
LOGO = 'https://sole-komerc.solekomerc.co.rs/wp-content/uploads/2024/12/logon-1.png'
LOGO_ALT = 'SOLE KOMERC'
BRAND = 'SOLE KOMERC'          # tekst mrvica na originalu

TOP = [('/', 'O NAMA'), ('/ugalj/', 'UGALJ'), ('/stovariste/', 'STOVARIŠTE'), ('/transport/', 'TRANSPORT'),
       ('/cene/', 'CENE'), ('/akcije/', 'AKCIJE'), ('/partneri-lista/', 'PARTNERI'),
       ('/dokumentacija/', 'DOKUMENTACIJA'), ('/kontakt/', 'KONTAKT')]
GROUPS = [
    ('/lignit/', ['/lignit-gracanica/', '/lignit-kolubara/', '/lignit-kostolac/', '/lignit-kovin/', '/lignit-kreka/', '/lignit-stanari/']),
    ('/mrko-lignitni-ugalj/', ['/ugalj-lubnica/', '/ugalj-mezgraja/', '/ugalj-pljevlja/', '/ugalj-ugljevik/']),
    ('/suseni-vreoci/', []),
    ('/mrki-ugalj/', ['/mrki-ugalj-banovici/', '/mrki-ugalj-breza/', '/mrki-ugalj-djurdjevik/', '/mrki-ugalj-jasenovac/',
                      '/mrki-ugalj-miljevina/', '/lignit-mrki-ugalj-resavica/', '/mrki-ugalj-ruski/', '/mrki-ugalj-soko/', '/mrki-ugalj-stavalj/']),
    ('/kameni-ugalj/', ['/ruski-kameni-ugalj-tip-d-mokro-separisani/']),
    ('/antracit/', []), ('/koks/', []), ('/drveni-pelet-od-biomase/', []), ('/primena-uglja-u-industriji/', []),
]
PARENT = {}
for g, ch in GROUPS:
    PARENT[g] = '/ugalj/'
    for c in ch:
        PARENT[c] = g
CHILDREN = dict(GROUPS)
KONTAKT = D['/kontakt/']['b']

E = lambda s: html.escape(s, quote=False)
A = lambda s: html.escape(s, quote=True)
def br(s): return '<br>'.join(E(x) for x in s.split('\n'))
def title(slug): return D[slug]['title']
def fix(u): return 'https:' + u if u.startswith('//') else u

def rel(frm, to):
    """Relativna putanja do strane (radi i sa servera i otvoreno sa diska)."""
    depth = 0 if frm == '/' else 1
    pre = '../' * depth
    return pre + ('' if to == '/' else to.strip('/') + '/') + 'index.html'
def asset(frm, f): return ('' if frm == '/' else '../') + 'assets/' + f

def imgs(slug): return [x for x in D[slug]['b'] if x[0] == 'img']
def first_img(slug):
    im = imgs(slug)
    return fix(im[0][1]) if im else None
def first_h1(slug):
    for x in D[slug]['b']:
        if x[0] == 'h1': return x[1]
    return None
def kcal(slug):
    for x in D[slug]['b']:
        if x[0] in ('li', 'p') and 'kalorij' in x[1].lower() and ':' in x[1] and len(x[1]) < 120:
            return x[1]
    return None

PHONE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>'

# ---------------- zajednički delovi ----------------
def head(slug, extra_css=''):
    t = title(slug)
    page_title = BRAND + ' – ' + TAGLINE if slug == '/' else t + ' – ' + BRAND
    return f'''<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(page_title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="{asset(slug, 'style.css')}">{extra_css}
</head>
<body>
<script>document.documentElement.className+=' js'</script>
'''

def tel_href(p): return 'tel:' + re.sub(r'[^\d+]', '', p)

UP = 'https://sole.izradasajtovasajta.com/wp-content/uploads/2026/10/'
TIP = {'/lignit/': 'lignit', '/mrko-lignitni-ugalj/': 'mrko', '/suseni-vreoci/': 'suseni', '/mrki-ugalj/': 'mrki', '/kameni-ugalj/': 'kameni',
       '/antracit/': 'antracit', '/koks/': 'koks', '/drveni-pelet-od-biomase/': 'pelet', '/primena-uglja-u-industriji/': 'zar'}
def photo(g, meni=False):
    """Obrađena fotografija vrste uglja iz medijateke (alati/slike: Real-ESRGAN + završna obrada); za meni manja verzija."""
    if g not in TIP: return None
    return UP + f'sole-ugalj-{TIP[g]}{"-m" if meni else ""}.jpg'
def mega_img(g): return photo(g, True)

def chain(slug):
    """Strana i svi njeni roditelji (za označavanje aktivne stavke menija)."""
    out = {slug}; p = PARENT.get(slug)
    while p: out.add(p); p = PARENT.get(p)
    return out

def mega(slug):
    cur = chain(slug); rows = []
    for g, ch in GROUPS:
        im = mega_img(g)
        kids = ''.join(f'<li><a href="{rel(slug, c)}">{E(title(c))}</a></li>' for c in ch)
        pic = f'<a class="pic" href="{rel(slug, g)}" tabindex="-1" aria-hidden="true"><img src="{A(im)}" alt="" loading="lazy" decoding="async"></a>' if im else ''
        pane = (f'<div class="pane{"" if ch else " leaf"}"><div class="pcol"><a class="ph" href="{rel(slug, g)}">{E(title(g))}</a>'
                + (f'<ul class="kids{" two" if len(ch) > 5 else ""}">{kids}</ul>' if ch else '') + f'</div>{pic}</div>')
        cls = 'grp' + (' has-kids' if ch else '') + (' on' if g in cur else '')
        rows.append(f'<li class="{cls}"><a class="g" href="{rel(slug, g)}">{E(title(g))}</a>{pane}</li>')
    return '<div class="mega"><div class="wrap mega-in"><ul class="rail">' + ''.join(rows) + '</ul></div></div>'

def header(slug):
    cur = chain(slug)
    items = []
    for s, lab in TOP:
        on = s in cur
        if s == '/ugalj/':
            items.append(f'<li class="has-mega{" on" if on else ""}"><a href="{rel(slug, s)}">{E(lab)}<i class="caret"></i></a>{mega(slug)}</li>')
        else:
            items.append('<li' + (' class="on"' if on else '') + f'><a href="{rel(slug, s)}">{E(lab)}</a></li>')
    # mobilni meni (isti redosled i isti nazivi kao mega meni)
    n = [0]
    def tg(label_id):
        return f'<button class="tg" type="button" aria-expanded="%s" aria-labelledby="{label_id}"></button>'
    dm = []
    for s, lab in TOP:
        if s == '/ugalj/':
            sub = []
            for g, ch in GROUPS:
                if ch:
                    n[0] += 1; gid = f'dl{n[0]}'; gopen = g in cur
                    inner = ''.join(f'<li><a href="{rel(slug, c)}">{E(title(c))}</a></li>' for c in ch)
                    sub.append(f'<li class="has-sub{" open" if gopen else ""}"><div class="row"><a id="{gid}" href="{rel(slug, g)}">{E(title(g))}</a>' + tg(gid) % ('true' if gopen else 'false') + f'</div><ul class="d-kids">{inner}</ul></li>')
                else:
                    sub.append(f'<li><div class="row"><a href="{rel(slug, g)}">{E(title(g))}</a></div></li>')
            n[0] += 1; uid = f'dl{n[0]}'; uopen = s in cur
            dm.append(f'<li class="has-sub{" open" if uopen else ""}"><div class="row"><a id="{uid}" href="{rel(slug, s)}">{E(lab)}</a>' + tg(uid) % ('true' if uopen else 'false') + f'</div><ul class="d-sub">{"".join(sub)}</ul></li>')
        else:
            dm.append(f'<li><div class="row"><a href="{rel(slug, s)}">{E(lab)}</a></div></li>')
    return f'''<div class="topbar"><div class="wrap"><div class="tb-tag">{E(TAGLINE)}</div></div></div>
<header class="site-head" id="head"><div class="wrap">
<a class="brand" href="{rel(slug, '/')}"><img src="{LOGO}" alt="{A(LOGO_ALT)}" width="190" height="46"></a>
<nav class="nav"><ul>{"".join(items)}</ul></nav>
<a class="head-call" href="{tel_href(PHONE)}">{PHONE_SVG}{E(PHONE)}</a>
<button class="burger" id="burger" type="button" aria-expanded="false"><span></span></button>
</div></header>
<div class="drawer" id="drawer"><div class="panel">
<div class="d-top"><img src="{LOGO}" alt="{A(LOGO_ALT)}"><button class="close" type="button">×</button></div>
<ul class="d-main">{"".join(dm)}</ul>
<a class="d-call" href="{tel_href(PHONE)}">{E(PHONE)}</a>
</div></div>
'''

def fl_kind(l):
    """Vrsta reda u kontakt bloku podnožja (za ikonicu): mejl, faks, radno vreme, telefon, inače adresa."""
    if '@' in l: return 'mail'
    if re.match(r'(?i)^fax\b', l): return 'fax'
    if re.search(r'(?i)ponedeljak|utorak|sreda|četvrtak|petak|subota|nedelja|\d{1,2}:\d{2}', l): return 'time'
    if re.match(r'^[+\d][\d\s,/().-]{6,}$', l): return 'tel'
    return 'pin'
def foot_lines(p):
    ls = [x for x in p.split('\n') if x.strip()]
    out, prev = [], None
    for i, l in enumerate(ls):
        k = 'ttl' if (i == 0 and len(ls) > 1 and l.upper() == l and not re.search(r'\d', l)) else fl_kind(l)
        cont = ' fl-c' if (prev == k and k != 'ttl') else ''
        out.append(f'<span class="fl fl-{k}{cont}">{E(l)}</span>'); prev = k
    return '<br>'.join(out)

def footer(slug):
    kp = [x[1] for x in KONTAKT if x[0] == 'p']   # direkcija, radno vreme, stovarište, radno vreme
    links = ''.join(f'<li><a href="{rel(slug, s)}">{E(l)}</a></li>' for s, l in TOP)
    groups = ''.join(f'<li><a href="{rel(slug, g)}">{E(title(g))}</a></li>' for g, _ in GROUPS)
    return f'''<footer class="foot"><div class="wrap">
<div class="cols">
<div class="f-brand"><img src="{LOGO}" alt="{A(LOGO_ALT)}"><p class="addr">{E(ADDR)}</p><p><a class="tel" href="{tel_href(PHONE)}">{E(PHONE)}</a></p></div>
<div><h4>{E(TOP[0][1])}</h4><ul>{links}</ul></div>
<div><h4>{E(TOP[1][1])}</h4><ul>{groups}</ul></div>
<div class="f-contact"><h4>{E(TOP[-1][1])}</h4><p class="fb">{foot_lines(kp[0])}</p><p class="fb">{foot_lines(kp[1])}</p><p class="fb">{foot_lines(kp[2])}</p><p class="fb">{foot_lines(kp[3])}</p></div>
</div>
<div class="bottom">{E(TAGLINE)}</div>
</div></footer>
<div class="lb" id="lb"><button class="x" type="button">×</button><button class="pv" type="button">‹</button><img alt=""><button class="nx" type="button">›</button></div>
<script src="{asset(slug, 'site.js')}"></script>
'''

BANNER_SLIKA = {   # strane bez vrste uglja: fotografije iz medijateke (isečci 1600x580 i original kamiona)
    '/stovariste/': '2024/12/DSC_0006-1600x580-1.jpg', '/transport/': '2024/12/IMG_0599-1600x580-1.jpg', '/cene/': '2024/12/3.-Coal-1600x580-1.jpg',
    '/akcije/': '2024/12/9339061661420800632-1600x580-1.jpg', '/partneri-lista/': '2024/12/IMG_0602-1600x580-1.jpg',
    '/dokumentacija/': '2024/12/ugalj-1600x580-1.jpg', '/kontakt/': '2024/12/DSC_0016.jpg'}
def banner_slika(slug):
    """Slika trake: obrađena fotografija vrste uglja (strana ili njena grupa), za ostale strane fotografija iz medijateke."""
    s = slug
    while s:
        if s in TIP: return UP + f'sole-ugalj-{TIP[s]}.jpg'
        s = PARENT.get(s)
    if slug == '/ugalj/': return UP + 'sole-ugalj-lignit.jpg'
    if slug in BANNER_SLIKA: return UP.replace('2026/10/', '') + BANNER_SLIKA[slug]
    return None

def banner(slug, h1_text):
    bg = banner_slika(slug)
    crumbs = [f'<li><a href="{rel(slug, "/")}">{E(BRAND)}</a></li>']
    chain = []
    p = PARENT.get(slug)
    while p:
        chain.insert(0, p); p = PARENT.get(p)
    for c in chain:
        lab = dict(TOP).get(c, title(c))
        crumbs.append(f'<li><a href="{rel(slug, c)}">{E(lab)}</a></li>')
    crumbs.append(f'<li><span>{E(title(slug))}</span></li>')
    bgdiv = f'<div class="bg" style="background-image:url(\'{A(bg)}\')"></div>' if bg else ''
    return f'''<section class="banner{'' if bg else ' noimg'}">{bgdiv}<div class="wrap">
<ol class="crumbs">{"".join(crumbs)}</ol>
<h1>{E(h1_text)}</h1><div class="rule"></div>
</div></section>
'''

def gallery(slug, items, key='g'):
    if not items: return ''
    tiles = ''.join(f'<a href="{A(fix(u))}" data-lb="{key}"><img src="{A(fix(u))}" alt="{A(al)}" loading="lazy"></a>' for _, u, al in items)
    n = len(items)
    if n <= 2: c, w = n, False
    elif n % 3 == 0: c, w = 3, False
    elif n % 4 == 0: c, w = 4, False
    elif (n - 1) % 3 == 0: c, w = 3, True
    else: c, w = 4, True
    cls = f'gallery g{c}' + (' gw' if w else '') + (' mw' if n % 2 == 1 and n > 1 else '')
    return f'<div class="{cls}">{tiles}</div>'

# ---------------- sadržaj (tekst se ne menja, samo se oblikuje) ----------------
SPEC_RE = re.compile(r'^([^:]{3,60}):(\s.*)$', re.S)
def is_caps(s): return len(s) < 70 and s.upper() == s and any(c.isalpha() for c in s)

def link_in(text, links):
    out = br(text)
    for lt, href in links:
        lt_e = br(lt)
        out = out.replace(lt_e, f'<a href="{A(href)}">{lt_e}</a>', 1)
    return out

def render_list(items):
    specs = sum(1 for x in items if SPEC_RE.match(x[1]))
    if specs >= max(2, len(items) * .5):
        rows = []
        for x in items:
            m = SPEC_RE.match(x[1])
            if m: rows.append(f'<li><span class="k">{E(m.group(1))}:</span><span class="v">{br(m.group(2).strip())}</span></li>')
            else: rows.append(f'<li class="one">{br(x[1])}</li>')
        return '<ul class="specs">' + ''.join(rows) + '</ul>'
    if all(re.search(r'\d', x[1]) for x in items) and len(items) >= 3:
        return '<ul class="specs">' + ''.join(f'<li class="one">{br(x[1])}</li>' for x in items) + '</ul>'
    return '<ul class="dots">' + ''.join(f'<li>{link_in(x[1], x[2] if len(x) > 2 else [])}</li>' for x in items) + '</ul>'

def render_body(items, inline_imgs=False, skip_h1=True, ids=None):
    out, buf, first_p = [], [], True
    def flush():
        if buf: out.append(render_list(buf)); buf.clear()
    i = 0
    while i < len(items):
        x = items[i]; t = x[0]
        # niz tehničkih vrednosti zapisan kao pasusi (npr. Breza) -> tehnički list
        if t == 'p' and SPEC_RE.match(x[1]) and len(x[1]) < 120:
            j = i
            while j < len(items) and items[j][0] == 'p' and SPEC_RE.match(items[j][1]) and len(items[j][1]) < 120: j += 1
            if j - i >= 2:
                flush(); out.append(render_list(items[i:j])); i = j; continue
        if t == 'li':
            buf.append(x); i += 1; continue
        flush()
        if t == 'h1':
            if not skip_h1: out.append(f'<h2>{E(x[1])}</h2>')
        elif t in ('h2', 'h3', 'h4'):
            hid = ''
            if ids is not None:
                hid = f' id="s{len(ids) + 1}"'; ids.append(x[1])
            tag = 'h2' if t == 'h2' else 'h3'
            out.append(f'<{tag}{hid}>{E(x[1])}</{tag}>')
        elif t in ('p', 't'):
            if is_caps(x[1]) and t == 'p':
                out.append(f'<p class="caps">{E(x[1])}</p>')
            else:
                cls = ' class="lead"' if first_p else ''
                out.append(f'<p{cls}>{link_in(x[1], x[2] if len(x) > 2 else [])}</p>')
                first_p = False
        elif t == 'img' and inline_imgs:
            out.append(f'<figure><a href="{A(fix(x[1]))}" data-lb="in"><img src="{A(fix(x[1]))}" alt="{A(x[2])}" loading="lazy"></a></figure>')
        i += 1
    flush()
    return '\n'.join(out)

def contact_box(slug):
    return f'''<div class="box dark"><h4>{E(TOP[-1][1])}</h4><p class="addr">{E(ADDR)}</p>
<p><a class="tel" href="{tel_href(PHONE)}">{E(PHONE)}</a></p><p><a class="more" href="{rel(slug, '/kontakt/')}">{E(TOP[-1][1])}</a></p></div>'''

def card(frm, slug):
    im = first_img(slug)
    ph = f'<img src="{A(im)}" alt="{A(imgs(slug)[0][2])}" loading="lazy">' if im else ''
    kc = kcal(slug)
    return f'''<a class="card" href="{rel(frm, slug)}"><div class="ph">{ph}</div><div class="bd"><div class="t">{E(title(slug))}</div>{f'<div class="kc">{E(kc)}</div>' if kc else ''}<div class="go"></div></div></a>'''

def grid(cards_html, n, narrow=False):
    if narrow: c = {1: 1, 2: 2, 3: 3, 4: 2}.get(n, 3)
    else: c = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 3, 7: 4, 8: 4}.get(n, 3 if n % 3 == 0 else 4)
    return f'<div class="cards n{c}">{cards_html}</div>'

def page_shell(slug, inner, extra_css=''):
    return head(slug, extra_css) + header(slug) + '<main>\n' + inner + '\n</main>\n' + footer(slug) + '</body>\n</html>\n'

def gallery_block(slug, im):
    if not im: return ''
    return '<div class="gallery-h"></div>' + gallery(slug, im)

# ---------------- tipovi strana ----------------
def product_page(slug):
    b = D[slug]['b']
    h1 = first_h1(slug) or title(slug)
    im = imgs(slug)
    body = render_body(b)
    par = PARENT.get(slug)
    sib = ''
    if par and par != '/ugalj/':
        lst = [par] + CHILDREN[par]
        sib = '<div class="box"><h4>' + E(title(par)) + '</h4><ul class="sib">' + ''.join(
            f'<li><a class="{"on" if s == slug else ""}" href="{rel(slug, s)}">{E(title(s))}</a></li>' for s in lst) + '</ul></div>'
    else:
        lst = [g for g, _ in GROUPS]
        sib = '<div class="box"><h4>' + E(dict(TOP)['/ugalj/']) + '</h4><ul class="sib">' + ''.join(
            f'<li><a class="{"on" if s == slug else ""}" href="{rel(slug, s)}">{E(title(s))}</a></li>' for s in lst) + '</ul></div>'
    kids = ''
    if CHILDREN.get(slug):
        kids = '<div style="margin-top:28px">' + grid(''.join(card(slug, c) for c in CHILDREN[slug]), len(CHILDREN[slug]), narrow=True) + '</div>'
    main = f'<div class="main prose">{body}{kids}{gallery_block(slug, im)}</div>'
    inner = banner(slug, h1) + f'<section class="page"><div class="wrap layout">{main}<aside class="aside">{sib}{contact_box(slug)}</aside></div></section>'
    return page_shell(slug, inner)

def ugalj_page(slug):
    b = D[slug]['b']
    im = imgs(slug)
    body = render_body(b)
    blocks = []
    for g, ch in GROUPS:
        if not ch: continue
        blocks.append(f'<div class="group-block"><div class="sec-h"><h2><a href="{rel(slug, g)}">{E(title(g))}</a></h2></div>{grid("".join(card(slug, c) for c in ch), len(ch))}</div>')
    leaf = [g for g, ch in GROUPS if not ch]
    blocks.append(f'<div class="group-block">{grid("".join(card(slug, g) for g in leaf), len(leaf))}</div>')
    inner = banner(slug, title(slug)) + f'''<section class="page"><div class="wrap layout">
<div class="main prose">{body}{gallery_block(slug, im)}</div><aside class="aside">{contact_box(slug)}</aside></div></section>
<section class="page" style="padding-top:0"><div class="wrap">{"".join(blocks)}</div></section>'''
    return page_shell(slug, inner)

def primena_page(slug):
    b = D[slug]['b']
    ids = []
    body = render_body(b, inline_imgs=True, ids=ids)
    toc = '<div class="box"><h4>' + E(title(slug)) + '</h4><ul class="toc">' + ''.join(
        f'<li><a href="#s{i + 1}">{E(t)}</a></li>' for i, t in enumerate(ids)) + '</ul></div>'
    inner = banner(slug, first_h1(slug)) + f'<section class="page"><div class="wrap layout"><div class="main prose">{body}</div><aside class="aside">{toc}{contact_box(slug)}</aside></div></section>'
    return page_shell(slug, inner)

def simple_page(slug, full=False):
    b = D[slug]['b']
    h1 = first_h1(slug) or title(slug)
    im = imgs(slug)
    body = render_body(b)
    lay = 'layout full' if full else 'layout'
    aside = '' if full else f'<aside class="aside">{contact_box(slug)}</aside>'
    inner = banner(slug, h1) + f'<section class="page"><div class="wrap {lay}"><div class="main prose">{body}{gallery_block(slug, im)}</div>{aside}</div></section>'
    return page_shell(slug, inner)

def cene_page(slug):
    b = D[slug]['b']
    h1 = first_h1(slug)
    pre, pay = [], []
    for x in b:
        (pay if x[0] == 'li' else pre).append(x)
    body = render_body(pre)
    lst = '<ul class="pay">' + ''.join(f'<li>{E(x[1])}</li>' for x in pay) + '</ul>'
    inner = banner(slug, h1) + f'<section class="page"><div class="wrap layout"><div class="main prose">{body}{lst}</div><aside class="aside">{contact_box(slug)}</aside></div></section>'
    return page_shell(slug, inner)

def partneri_page(slug):
    b = D[slug]['b']
    h1 = first_h1(slug)
    ps = [x[1] for x in b if x[0] == 'p']
    intro, rest = ps[0], ps[1:]
    lis = ''.join(f'<li class="{"sub" if s.startswith("–") else ""}">{E(s)}</li>' for s in rest)
    inner = banner(slug, h1) + f'<section class="page"><div class="wrap"><p class="partners-intro">{E(intro)}</p><ul class="partners">{lis}</ul></div></section>'
    return page_shell(slug, inner)

def dok_page(slug):
    b = D[slug]['b']
    h1 = first_h1(slug)
    docs = ''.join(f'<li><a href="{A(x[2][0][1])}" target="_blank" rel="noopener"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/></svg></span><div>{E(x[1])}</div></a></li>' for x in b if x[0] == 'p')
    inner = banner(slug, h1) + f'<section class="page"><div class="wrap"><ul class="docs">{docs}</ul></div></section>'
    return page_shell(slug, inner)

def kontakt_page(slug):
    b = D[slug]['b']
    h3 = b[0][1]
    ps = [x[1] for x in b if x[0] == 'p']
    form = [x for x in b if x[0] == 'form'][0]
    boxes = ''
    for i in (0, 2):
        lines = ps[i]
        lines_h = br(lines)
        for m in re.findall(r'[\w.+-]+@[\w.-]+', lines):
            lines_h = lines_h.replace(E(m), f'<a href="mailto:{A(m)}">{E(m)}</a>')
        boxes += f'<div class="cbox"><p class="lines">{lines_h}</p><p class="hours">{br(ps[i + 1])}</p></div>'
    f = form
    frm = f'''<div class="form-wrap"><h3>{E(h3)}</h3><form class="form">
<input type="text" name="your-name" placeholder="{A(f[1])}"><input type="email" name="your-email" placeholder="{A(f[2])}">
<input class="full" type="text" name="your-subject" placeholder="{A(f[3])}"><textarea class="full" name="your-message" placeholder="{A(f[4])}"></textarea>
<button type="submit">{E(f[5])}</button></form></div>'''
    inner = banner(slug, title(slug)) + f'<section class="page"><div class="wrap"><div class="contact-grid">{boxes}</div>{frm}</div></section>'
    return page_shell(slug, inner)

def mk(text, phrases=()):
    """Tekst pasusa neizmenjen; samo se delovi koji nose suštinu uokviruju oznakom <mark> (isticanje, ne novi tekst)."""
    out = E(text)
    for ph in phrases:
        e = E(ph)
        assert e in out, ph
        out = out.replace(e, f'<mark>{e}</mark>', 1)
    return out

def type_card(frm, slug):
    """Vrsta uglja kao razvlačeći panel (naslovna)."""
    kc = kcal(slug)
    return (f'<a class="type" href="{rel(frm, slug)}"><img src="{A(photo(slug))}" alt="" loading="lazy">'
            f'<div class="tt"><div class="t">{E(title(slug))}</div>' + (f'<div class="kc">{E(kc)}</div>' if kc else '') + '</div><i class="go"></i></a>')

def home_body(slug):
    """Naslovna ispod uvoda: priča o preduzeću u poglavljima (tekst i slike su doslovno iz podaci/sve.json, bez ponovljenog naslova)."""
    b = D[slug]['b']
    slides = [x for x in b if x[0] == 'img']
    caps = [x[1] for x in b if x[0] == 't']
    rest = [x for x in b if x[0] not in ('img', 't')]
    P = [x[1] for x in rest[1:]]          # rest[0] je naslov „Dobrodošli na naš sajt” (uklonjen po zahtevu: uvod već kaže dobrodošlicu)
    def fig(i, cls=''):
        _, u, al = slides[i]
        return (f'<figure{f" class=\"{cls}\"" if cls else ""}><img src="{A(fix(u))}" alt="{A(al)}" loading="lazy">'
                f'<figcaption>{E(caps[i]) if i < len(caps) else ""}</figcaption></figure>')
    def bg(i):
        _, u, al = slides[i]
        return f'<figure class="ab-lead-bg"><img src="{A(fix(u))}" alt="" loading="lazy"></figure>'
    def fig_full(i, cls, name):
        """Ista fotografija u većoj rezoluciji iz medijateke (original umesto isečka 1600x580)."""
        _, u, al = slides[i]
        return f'<figure class="{cls}"><img src="{A(fix(u.rsplit("/", 1)[0] + "/" + name))}" alt="{A(al)}" loading="lazy"><figcaption>{E(caps[i]) if i < len(caps) else ""}</figcaption></figure>'
    types = ''.join(type_card(slug, g) for g, _ in GROUPS)
    return f'''<section class="ab ab-dark ab-lead2">{bg(0)}<div class="wrap"><p class="ab-lead">{mk(P[0], ['trgovine čvrstim energentima', 'stovarišta i distributivnog centra'])}</p>
<p class="ab-addr">{mk(P[1])}</p></div></section>
<section class="ab ab-dark ab-who">{fig(1, 'ab-bgimg par')}<div class="wrap"><p class="ab-state">{mk(P[2], ['domaćinstvima', 'institucijama', 'velikim industrijskim potrošačima'])}</p></div></section>
<section class="ab ab-eq"><div class="ab-eq-pin"><div class="ab-eq-figs">{fig(4, 'eqf b1')}{fig(2, 'eqf b2')}{fig_full(5, 'eqf b3', 'DSC_0016.jpg')}</div>
<div class="ab-eq-text"><p class="ab-body">{mk(P[3], ['magacinskim prostorom', 'mehanizacijom', 'industrijskim kolosekom', 'kiper vozilima nosivosti od 1 do 26 tona', 'kolskom vagom mernog opsega do 60 tona'])}</p></div></div></section>
<section class="ab ab-lt ab-story"><div class="ab-story-grid">{fig(0, 'ab-stage')}<div class="ab-time">
<p class="ab-node n1">{mk(P[6], ['preko 70 zaposlenih radika'])}</p>
<p class="ab-node n2">{mk(P[7], ['„Ilić Trgovina“'])}</p>
<p class="ab-node n3">{mk(P[8], ['Od 2012. godine', '„Mlin Dobrinci“'])}</p></div></div></section>
<section class="ab ab-wh ab-log">{fig(3, 'pf ab-band')}<div class="wrap"><div class="ab-log-card"><p class="ab-body">{mk(P[4], ['Beograd, Novi Sad, Pančevo i Prahovo', 'Rostov, Novorusijsk, Solun i Izmail', 'železničkog transporta'])}</p><p class="ab-note">{mk(P[5])}</p></div></div></section>
<section class="ab ab-bl ab-iso"><div class="ab-iso-grid"><div class="ab-iso-text"><p class="ab-body">{mk(P[9], ['ISO 9001/2008'])}</p><p class="ab-cert">{mk(P[10], ['29.02.2012. godine', 'SRPS ISO 9001:2008'])}</p></div>{fig(7, 'ab-isoimg')}</div></section>
<section class="ab ab-types"><div class="wrap"><h2>{E(TOP[1][1])}</h2><div class="types-row">{types}</div></div></section>'''

def home_page(slug):
    intro = '''<section id="intro"><div class="stick" id="stick">
<div class="hero" id="hero"><canvas id="gl"></canvas><div class="veil"></div>
<div class="copy"><div class="in"><h1><span class="a">DOBRODOŠLI NA PREZENTACIJU PREDUZEĆA</span> <span class="b">SOLE KOMERC</span> <span class="c">D.O.O. BEOGRAD</span></h1></div></div>
</div>
<svg class="cover" id="hcMask" viewBox="0 0 1600 900" aria-hidden="true"><defs>
<mask id="hcCut" maskUnits="userSpaceOnUse" x="-20000" y="-20000" width="40000" height="40000">
<rect x="-20000" y="-20000" width="40000" height="40000" fill="#fff"></rect>
<g id="hcWord"><text id="hcT1" x="800" y="430" text-anchor="middle" font-size="300" fill="#000">SOLE</text><text id="hcT2" x="800" y="660" text-anchor="middle" font-size="240" fill="#000">KOMERC</text></g>
</mask>
</defs>
<rect id="hcCover" x="-20000" y="-20000" width="40000" height="40000" fill="#060403" fill-opacity=".97" mask="url(#hcCut)"></rect>
<g id="hcLine"><text id="hcL1" x="800" y="430" text-anchor="middle" font-size="300" fill="none"></text><text id="hcL2" x="800" y="660" text-anchor="middle" font-size="240" fill="none"></text></g>
</svg>
<div class="hint"><i></i></div>
</div></section>'''
    css = f'\n<link rel="stylesheet" href="{asset(slug, "uvod.css")}">'
    scripts = '''<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
<script src="assets/uvod.js"></script>
'''
    page = page_shell(slug, intro + home_body(slug), css).replace('<body>', '<body class="has-intro intro-hide-head">', 1)
    return page.replace('</body>', scripts + '</body>')

# ---------------- slaganje ----------------
def build():
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'assets'))
    for f in ('style.css', 'site.js', 'uvod.css', 'uvod.js'):
        shutil.copy(os.path.join(ROOT, 'assets', f), os.path.join(OUT, 'assets', f))
    for slug in D:
        if slug == '/': h = home_page(slug)
        elif slug == '/ugalj/': h = ugalj_page(slug)
        elif slug == '/primena-uglja-u-industriji/': h = primena_page(slug)
        elif slug == '/cene/': h = cene_page(slug)
        elif slug == '/partneri-lista/': h = partneri_page(slug)
        elif slug == '/dokumentacija/': h = dok_page(slug)
        elif slug == '/kontakt/': h = kontakt_page(slug)
        elif slug in ('/stovariste/', '/akcije/'): h = simple_page(slug, full=True)
        elif slug == '/transport/': h = simple_page(slug)
        else: h = product_page(slug)
        d = OUT if slug == '/' else os.path.join(OUT, slug.strip('/'))
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(h)
    print('strana:', len(D))

if __name__ == '__main__':
    build()
