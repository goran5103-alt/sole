#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sastavlja fajlove teme iz izvora u alati/assets/ (isti CSS/JS kao makete + WordPress dodaci).
Upotreba: python3 alati/sync_tema.py   (posle izmene alati/assets/*)"""
import os, re, shutil
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(R, 'alati', 'assets'); T = os.path.join(R, 'tema', 'sole-komerc')
VER = re.search(r"define\( 'SOLE_VER', '([\d.]+)' \)", open(os.path.join(T, 'functions.php'), encoding='utf-8').read()).group(1)
head = f'''/*
Theme Name: Sole Komerc
Theme URI: https://sole-komerc.solekomerc.co.rs
Author: IT Expert
Description: Tema za Sole Komerc bez page buildera. Tekst i slike strana uređuju se ITX dodatkom, ostalo kroz Opcije teme i WordPress menije.
Version: {VER}
Requires at least: 6.0
Requires PHP: 7.4
Text Domain: sole-komerc
*/
'''
css = head + open(os.path.join(A, 'style.css'), encoding='utf-8').read().rstrip('\n') + '\n\n' + open(os.path.join(A, 'wp-dodaci.css'), encoding='utf-8').read()
open(os.path.join(T, 'style.css'), 'w', encoding='utf-8').write(css)
os.makedirs(os.path.join(T, 'assets'), exist_ok=True)
for f in ('site.js', 'uvod.js', 'uvod.css'):
    shutil.copy(os.path.join(A, f), os.path.join(T, 'assets', f))
print('tema', VER, 'sastavljena')
