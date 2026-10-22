#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tekst-straza.py — cuvar teksta na sajtu.
Vidi SKILL.md za upotrebu. Radi samo sa standardnim Python 3."""

import sys, os, re, json, argparse
from html.parser import HTMLParser

PRESKOCI_TAGOVE = {'script', 'style', 'noscript', 'svg', 'template'}

# Tagovi unutar recenice — ne smeju da je preseku na dva nalaza.
INLINE = {'a', 'b', 'strong', 'i', 'em', 'span', 'small', 'u', 'mark', 'code',
          'sub', 'sup', 'abbr', 'time', 'label', 'q', 'cite', 'del', 'ins',
          'var', 'samp', 'kbd', 'bdi', 'bdo', 'wbr', 'font'}

# Atributi u kojima takodje zivi tekst koji korisnik cita ili Google indeksira
TEKST_ATRIBUTI = ('alt', 'title', 'placeholder', 'aria-label', 'content', 'value')

# Meta tagovi cije "content" polje NIJE tekst za citanje (tehnicke vrednosti)
META_TEHNICKI = re.compile(
    r'^(width=|IE=|text/|https?://|[\d.,\s]+$|index|noindex|follow|nofollow|'
    r'summary|website|article|sr[-_]|en[-_]|UTF-8|utf-8|#|max-image-preview)', re.I)


class Citac(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.komadi = []          # (tekst, linija)
        self._stek = []
        self._json_ld = False
        self._bafer = []          # delovi jedne recenice (inline tagovi)
        self._bafer_linija = 0

    def _isprazni(self):
        """Spoji nakupljene delove u jednu recenicu i upisi je kao jedan nalaz."""
        if not self._bafer:
            return
        t = re.sub(r'\s+', ' ', ' '.join(self._bafer)).strip()
        t = re.sub(r'\s+([.,;:!?%)\]])', r'\1', t)
        t = re.sub(r'([(\[])\s+', r'\1', t)
        if t:
            self.komadi.append((t, self._bafer_linija))
        self._bafer = []

    def handle_starttag(self, tag, attrs):
        if tag not in INLINE:
            self._isprazni()
        if tag == 'br':
            self._bafer.append(' ')
        self._stek.append(tag)
        d = dict(attrs)
        if tag == 'script' and (d.get('type', '').lower() == 'application/ld+json'):
            self._json_ld = True
        for a in TEKST_ATRIBUTI:
            v = d.get(a)
            if not v:
                continue
            v = v.strip()
            if not v or META_TEHNICKI.match(v):
                continue
            if a == 'value' and tag == 'input' and d.get('type', '') not in ('submit', 'button'):
                continue
            self.komadi.append((v, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self._stek and self._stek[-1] == tag:
            self._stek.pop()

    def handle_endtag(self, tag):
        if tag == 'script':
            self._json_ld = False
        if tag not in INLINE:
            self._isprazni()
        while self._stek:
            t = self._stek.pop()
            if t == tag:
                break

    def close(self):
        super().close()
        self._isprazni()

    def handle_data(self, data):
        if self._json_ld:
            self._json_ld_data(data)
            return
        if any(t in PRESKOCI_TAGOVE for t in self._stek):
            return
        t = data.strip()
        if t:
            if not self._bafer:
                self._bafer_linija = self.getpos()[0]
            self._bafer.append(t)

    def _json_ld_data(self, data):
        """Iz JSON-LD vadimo samo tekstualne vrednosti koje covek cita."""
        try:
            podaci = json.loads(data)
        except Exception:
            return
        lin = self.getpos()[0]

        def hodaj(x):
            if isinstance(x, dict):
                for k, v in x.items():
                    if k.startswith('@') or k in ('url', 'image', 'logo', 'sameAs',
                                                  'telephone', 'email', 'latitude',
                                                  'longitude', 'postalCode', 'openingHours'):
                        continue
                    hodaj(v)
            elif isinstance(x, list):
                for v in x:
                    hodaj(v)
            elif isinstance(x, str):
                s = x.strip()
                if len(s) > 2 and not META_TEHNICKI.match(s):
                    self.komadi.append((s, lin))
        hodaj(podaci)


def sredi(s):
    """Normalizacija za poredjenje: razmaci, navodnici, crtice."""
    s = s.replace(' ', ' ')
    s = s.replace('‘', "'").replace('’', "'")
    s = s.replace('“', '"').replace('”', '"')
    s = s.replace('„', '"').replace('‚', "'")
    s = s.replace('–', '-').replace('—', '-').replace('−', '-')
    s = re.sub(r'\s+', ' ', s)
    return s.strip()


def procitaj_fajl(put):
    with open(put, 'r', encoding='utf-8', errors='replace') as f:
        sadrzaj = f.read()
    c = Citac()
    try:
        c.feed(sadrzaj)
        c.close()
    except Exception as e:
        print('  ! greska pri citanju %s: %s' % (put, e), file=sys.stderr)
    return c.komadi


def pokupi(koren):
    """Vrati {relativni_put: [(tekst, linija), ...]} za sve HTML fajlove."""
    rez = {}
    if os.path.isfile(koren):
        rez[os.path.basename(koren)] = procitaj_fajl(koren)
        return rez
    for dirp, dirn, fajlovi in os.walk(koren):
        dirn[:] = [d for d in dirn if not d.startswith('.') and d != 'node_modules']
        for f in sorted(fajlovi):
            if f.lower().endswith(('.html', '.htm')):
                p = os.path.join(dirp, f)
                rez[os.path.relpath(p, koren)] = procitaj_fajl(p)
    return rez


def ucitaj_izvor(put):
    """Izvor moze biti folder sa HTML-om ili ranije snimljen .json."""
    if os.path.isfile(put) and put.lower().endswith('.json'):
        with open(put, 'r', encoding='utf-8') as f:
            return set(json.load(f)['tekstovi'])
    skup = set()
    for _, komadi in pokupi(put).items():
        for t, _l in komadi:
            skup.add(sredi(t))
    return skup


def snimi(putanja_sajta, izlaz):
    skup = sorted(ucitaj_izvor(putanja_sajta))
    with open(izlaz, 'w', encoding='utf-8') as f:
        json.dump({'izvor': os.path.abspath(putanja_sajta), 'tekstovi': skup},
                  f, ensure_ascii=False, indent=1)
    print('Snimljeno %d odobrenih tekstova u: %s' % (len(skup), izlaz))


def main():
    p = argparse.ArgumentParser(add_help=True)
    p.add_argument('--izvor', help='folder originala ili .json snimak odobrenog stanja')
    p.add_argument('--sada', help='folder sajta koji se proverava')
    p.add_argument('--snimi', help='folder sajta ciji se tekst snima kao odobren')
    p.add_argument('--u', help='izlazni .json za --snimi', default='odobreno.json')
    p.add_argument('--min', type=int, default=3, help='ignorisi tekst kraci od N znakova')
    a = p.parse_args()

    if a.snimi:
        snimi(a.snimi, a.u)
        return 0

    if not a.izvor or not a.sada:
        p.print_help()
        return 2

    izvor = ucitaj_izvor(a.izvor)
    izvor_spojen = '\n'.join(izvor)
    sada = pokupi(a.sada)

    novo, skraceno = [], []
    videno = set()

    for fajl in sorted(sada):
        for tekst, linija in sada[fajl]:
            s = sredi(tekst)
            if len(s) < a.min:
                continue
            videno.add(s)
            if s in izvor:
                continue
            if s in izvor_spojen:
                skraceno.append((fajl, linija, s))
            else:
                novo.append((fajl, linija, s))

    izbaceno = sorted(t for t in izvor
                      if len(t) >= a.min and t not in videno
                      and not any(t in v for v in videno))

    print('=' * 72)
    print('STRAZA TEKSTA')
    print('  izvor : %s   (%d odobrenih tekstova)' % (a.izvor, len(izvor)))
    print('  sada  : %s   (%d fajlova)' % (a.sada, len(sada)))
    print('=' * 72)

    print('\n### NOVO — ne postoji u izvoru (%d)' % len(novo))
    if not novo:
        print('    nema')
    for f, l, s in novo:
        print('  %s:%d' % (f, l))
        print('      %s' % s)

    print('\n### SKRACENO — deo recenice iz izvora (%d)' % len(skraceno))
    if not skraceno:
        print('    nema')
    for f, l, s in skraceno:
        print('  %s:%d' % (f, l))
        print('      %s' % s)

    print('\n### IZBACENO — iz izvora, nema ga vise nigde (%d)' % len(izbaceno))
    if not izbaceno:
        print('    nema')
    for s in izbaceno:
        print('      %s' % s)

    ukupno = len(novo) + len(skraceno) + len(izbaceno)
    print('\n' + '=' * 72)
    print('UKUPNO NALAZA: %d  (novo %d, skraceno %d, izbaceno %d)'
          % (ukupno, len(novo), len(skraceno), len(izbaceno)))
    print('=' * 72)
    return 1 if ukupno else 0


if __name__ == '__main__':
    sys.exit(main())
