# Victor Van Sande, CV en portfolio

Een statische one-page portfolio. Elke sectie opent met een eigen foto in
breedbeeld en neemt daar haar kleuren van over. Weinig beweging, alles staat
open. Geen build-stap: pure HTML, CSS en JavaScript.

Live: <https://victorvansande.github.io/cv/>

## Structuur

| Bestand | Rol |
|---|---|
| `index.html` | De volledige one-page site (secties: home, werk, ervaring, opleiding met masterproef, over mij, KSA, contact) |
| `style.css` | Paletten per sectie (`.g-*`), layout, responsive, en onderaan de intro-animatie |
| `main.js` | Interacties: intro, taal, toegankelijkheid, menu, lightbox, voorproefvenster |
| `v1/` | De vorige versie van de site, ongewijzigd bewaard |
| `i18n.js` | Engelse vertalingen (NL staat inline in `index.html` via `data-i18n`) |
| `404.html` | Custom 404-pagina in dezelfde stijl |
| `over.html`, `opleiding.html`, `ervaring.html`, `contact.html` | Redirect-stubs die oude multi-page URL's doorsturen naar de juiste sectie van `index.html` |
| `serve.ps1` | Lokale dev-server (PowerShell) |
| `cv-print.html` | Print-geoptimaliseerde bron voor de downloadbare CV-PDF |
| `assets/` | Profielfoto, diplomascans, CV-PDF, masterproef-PDF, og-image + bron/script, favicon en app-iconen (`assets/icons`, script `icon-gen.ps1`) |
| `ONTWERP.md` | Regelboek van het ontwerp: keuzes en hun reden, kleuren per hoofdstuk, wat afgewezen is, stappenlijsten per soort wijziging |
| `CLAUDE.md`, `SCHRIJFSTIJL.md` | Werkafspraken en technische valkuilen, en de schrijfstijl |
| `manifest.webmanifest` | Naam en iconen voor wie de site aan het startscherm toevoegt |

## Functies

- **Kleuren**: vast per sectie, afgeleid van de foto bovenaan die sectie
- **Taal**: NL/EN-schakelaar; vertalingen via `data-i18n` in `index.html`, Engelse teksten in `i18n.js`
- **Toegankelijkheid**: toggle voor minder beweging / hoger contrast
- **Cache-busting**: versies via `?v=N` op `style.css` / `i18n.js` / `main.js` (ophogen bij een wijziging)

## Lokaal bekijken

Open `index.html` rechtstreeks, of start de dev-server:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
# → http://localhost:5180/
```

## Hosten

Statisch: push naar GitHub met Pages aan, of sleep de map in Netlify/Vercel.

## De CV-PDF bijwerken

`assets/cv-victor-van-sande.pdf` wordt los gerenderd uit `cv-print.html`
(headless Edge, `--print-to-pdf`). Bij inhoudelijke wijzigingen op de site
moet de PDF apart opnieuw gegenereerd worden, want die loopt niet automatisch mee.

## De link-preview afbeelding bijwerken

`assets/og-image.jpg` (getoond bij het delen van de link) wordt gerenderd uit
`assets/og-source.html`. Regenereren met:

```powershell
powershell -ExecutionPolicy Bypass -File assets/og-gen.ps1
```
