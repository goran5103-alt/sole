#!/usr/bin/env python3
"""Renderuje slike vrsta uglja iz alati/render/studio.html (3D, bez spoljnih fotografija).
Upotreba: python3 render.py <tip> <sirina> <visina> <seme> <izlaz.jpg>   (tip: lignit mrko suseni mrki kameni antracit koks pelet zar)"""
import sys, os, io, base64, asyncio
from playwright.async_api import async_playwright
tip, w, h, seed, out = sys.argv[1:6]
EXE = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=EXE, proxy={'server': os.environ['HTTPS_PROXY']} if os.environ.get('HTTPS_PROXY') else None,
                                   args=['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': int(w), 'height': int(h)})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file://' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'studio.html') + f'#{tip},{w},{h},{seed}')
        try: await pg.wait_for_function('window.__done===true', timeout=240000)
        except Exception as e: print('timeout', errs[:3]); await b.close(); return
        data = await pg.evaluate("document.getElementById('c').toDataURL('image/jpeg',0.9)")
        open(out, 'wb').write(base64.b64decode(data.split(',')[1]))
        print('ok', out, len(data)//1024, 'KB', errs[:2])
        await b.close()
asyncio.run(main())
