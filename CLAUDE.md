# Sole Komerc — prebacivanje redizajna u WordPress

Ovaj fajl Claude Code čita sam na početku svake sesije. Važi za ceo projekat.

## Ko je korisnik i kako se radi

- Korisnik je Goran, izrađuje sajtove oko 15 godina. Piše se **isključivo latinicom**, srpskim (ne hrvatskim) rečima, i korisniku se obraća u muškom rodu.
- Izveštaji su **kratki i jednostavni**. Ti uradiš što više sam, a od njega tražiš samo ono što mora.
- Kad korisnik da numerisane stavke, za **svaku stavku posebno** napišeš šta si uradio i potvrdiš da si je pregledao kompletno (ne uzorak).
- **Ne menjaš, ne dodaješ i ne brišeš NIŠTA što nije izričito traženo**: ni tekst, ni slovne greške, ni velika slova. Kad nešto nedostaje ili deluje pogrešno, staneš i pitaš.
- Posao nije gotov dok nije testiran i dok ne postoji **dokaz** (merenje, snimak celog ekrana). Ništa se ne isključuje radi merenja. Ne tvrdiš da je nešto urađeno bez provere.
- Ne daješ cifre napamet. Brojiš i meriš.
- Kad vodiš korak po korak proces, sam pominješ obavezne korake.
- Kod dodatka koji isporučuješ ili menjaš: pri svakoj izmeni **povećaj broj verzije** (zaglavlje i konstanta).

## Šta postoji u ovom paketu

| Folder | Šta je |
|---|---|
| `makete/` | Gotove i odobrene HTML makete svih **38 strana** (index.html po strani + `assets/`). Ovo je izgled koji se prebacuje u WordPress. |
| `podaci/sve.json` | Doslovan tekst i slike svake strane, preuzeto sa živog sajta. `podaci/verify.py` dokazuje da je identično originalu (38/38). |
| `alati/build.py` | Generator maketa iz `sve.json` (raspored svake vrste strane). |
| `alati/proveri.py` + `alati/tekst-straza.py` | **Straža teksta**: poredi svaku rečenicu na strani sa originalom i prijavi NOVO / SKRACENO / IZBACENO. |
| `alati/assets/` | CSS i JS maketa: `style.css`, `site.js`, `uvod.css` + `uvod.js` (animirani uvod naslovne, three.js r128). |
| `dodatak/itx-content-editor-1.6.1.zip` | Naš dodatak za bezbedno uređivanje teksta i slika na stranama. **Koristi se on**, ne piše se novi. |
| `uvod-izvor/` | Izvorne probne verzije animacije žara (sa uvodom i bez). |
| `divljina-referenca/` | Kako je isti uvod sa maskom urađen u temi Divljina (widget, JS, CSS), kao uzor. |

## Zadatak

Radni poddomen je **kopija živog sajta sole-komerc.solekomerc.co.rs**. Na njemu se radi sve. Na živom sajtu se ne dira apsolutno ništa.

1. **Rezervna kopija pre bilo čega:** baza i fajlovi poddomena.
2. **Nova tema** `sole-komerc` (bez page buildera), koja izgleda tačno kao `makete/`, na računaru i na telefonu.
3. **Sadržaj u postojeće strane:** sadržaj svake strane ide u **postojeću** WordPress stranu sa istom adresom (slug). Nove strane se ne prave i adrese se ne menjaju, jer su indeksirane u Google-u.
4. **Ništa tvrdo kodirano.** Sve što posetilac čita mora klijent da može da menja:
   - **u uređivaču (ITX dodatak):** tekst i slike unutar strana (post_content);
   - **u opcijama teme:** telefon, adresa, tekst gornje trake, logo, tekst uvoda (SOLE / KOMERC i tri reda naslova), kontakt blok u bočnoj koloni i podnožje, uključi/isključi uvod;
   - **kroz WordPress menije:** glavni meni i mega meni UGALJ (grupe i podstavke), meni u podnožju.
   - Ako ti se učini da nešto mora da bude tvrdo kodirano, **stani i pitaj**.
5. **Slike** iz postojeće medijateke poddomena (već su tamo, jer je sajt kopiran). Ne uploaduj nove kopije i ne vuci ih sa živog domena.
6. **Kontakt obrazac:** na sajtu postoji Contact Form 7 (forma 2249). Koristi nju, sa istim poljima, u izgledu makete.
7. **Brisanje:** na poddomenu obriši teme i dodatke koji više ne trebaju. **Pre brisanja pokaži korisniku spisak šta brišeš i zašto, i čekaj potvrdu.** Elementor se gasi tek kad su sve strane prebačene i provereno je da nijedna više ne zavisi od njega.
8. **Praćenje pregleda (preview tracker):** ugrađuje se na svaki poddomen, sa opcijom uključi/isključi u opcijama teme. Fajlovi (`track.php`, `dashboard.php`) **nisu u paketu**: traži ih od korisnika, ne piši novi.
9. **Mobilna verzija** se piše uporedo sa desktop verzijom. Izmene za telefon ne smeju da poremete računar.

## Pravila za tekst (obavezno)

- Tekst se uzima **isključivo** iz `podaci/sve.json` (ili iz postojećih strana na poddomenu, ako su identične). Ništa se ne prepisuje rukom.
- Sa originala su namerno izostavljeni samo: oznaka „admin” i datumi objave (deo stare teme). Korisnik još nije odgovorio da li to ostaje tako.
- **Otvorena pitanja (ostavi kao original dok korisnik ne odgovori):** nazivi fajlova ispod 8 fotografija na naslovnoj; prazne strane Stovarište i Akcije.
- **Pre svake isporuke** pokreni proveru teksta na živim stranama poddomena (preuzmi HTML strane i uporedi sa `podaci/sve.json` kao kod `alati/proveri.py`) i **pokaži korisniku ceo nalaz**. Ništa se ne isporučuje dok svaka stavka nije odobrena ili vraćena.

## Provera pre isporuke (svaki put)

- [ ] Rezervna kopija postoji
- [ ] Svih 38 strana otvoreno na poddomenu, na računaru (1440 px) i telefonu (390 px), snimak **cele** strane
- [ ] Nijedna strana ne skroluje bočno; nema grešaka u konzoli
- [ ] Straža teksta: 0 novo / 0 skraćeno / 0 izbačeno (ili svaka stavka odobrena)
- [ ] Svaki tekst se menja kroz uređivač, opcije teme ili meni (proveri uzorkom izmene i vrati)
- [ ] ITX uređivač otvara svaku stranu i čuva bez kvarenja (bez izmena izlaz je isti)
- [ ] Uvod naslovne radi pri skrolovanju; pri „smanjenom pokretu” prikazuje se bez animacije
- [ ] Tracker uključen i isključuje se iz opcija
- [ ] Spisak obrisanih tema i dodataka odobren od korisnika

## Pristup serveru

Najbolje je preko SSH-a sa WP-CLI. Ako SSH ne postoji, pitaj korisnika šta ima (FTP, pristup bazi, admin nalog). Lozinke se ne upisuju u fajlove projekta.
