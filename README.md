# Victor Van Sande — CV / Portfolio

Een moderne, statische one-page portfolio met glassmorphism, scroll-animaties en
interactieve elementen. Geen build-stap: pure HTML, CSS en JavaScript.

Live: <https://victorvansande.github.io/cv/>

## Structuur

| Bestand | Rol |
|---|---|
| `index.html` | De volledige one-page site (secties: home, over, opleiding, ervaring, contact) |
| `style.css` | Design system — kleuren/thema's, glass, layout, responsive, animaties |
| `main.js` | Interacties — scroll-reveals, tellers, cursor-spotlight, thema/modus, taal, toegankelijkheid, lightbox, quote-rotator |
| `404.html` | Custom 404-pagina in dezelfde stijl |
| `over.html`, `opleiding.html`, `ervaring.html`, `contact.html` | Redirect-stubs die oude multi-page URL's doorsturen naar de juiste sectie van `index.html` |
| `serve.ps1` | Lokale dev-server (PowerShell) |
| `assets/` | Profielfoto, diplomascans, og-image, CV-PDF, masterproef-PDF |

## Functies

- **Thema's** — 7 kleurthema's + licht/donker, bewaard in `localStorage`
- **Taal** — NL/EN-schakelaar; vertalingen via `data-i18n` in `main.js`
- **Toegankelijkheid** — toggle voor minder beweging / hoger contrast
- **Cache-busting** — versies via `?v=N` op `style.css` / `main.js` (ophogen bij een wijziging)

## Lokaal bekijken

Open `index.html` rechtstreeks, of start de dev-server:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
# → http://localhost:5180/
```

## Hosten

Statisch — push naar GitHub met Pages aan, of sleep de map in Netlify/Vercel.

## De CV-PDF bijwerken

`assets/cv-victor-van-sande.pdf` wordt los gerenderd uit een print-HTML-template
(headless Chrome). Bij inhoudelijke wijzigingen op de site moet de PDF apart
opnieuw gegenereerd worden — die loopt niet automatisch mee.
