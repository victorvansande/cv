# Werkafspraken voor Claude in deze repo

Dit bestand bundelt de afspraken die tot nu toe enkel in het lokale geheugen van
Claude stonden, zodat een sessie op een andere machine of in de cloud er
meteen mee verder kan. De repo is **publiek**: hier staat bewust niets dat niet
ook al op de site zelf te vinden is.

Over de site zelf (structuur, thema's, hosten) gaat [README.md](README.md). Over
de schrijfstijl gaat [SCHRIJFSTIJL.md](SCHRIJFSTIJL.md).

## Vaste afspraken

- **Communicatie met Victor gebeurt in het Nederlands.**
- **Na elke afgeronde wijziging meteen committen en pushen** naar `origin`
  (`github.com/victorvansande/cv`, branch `main`), zonder eerst te vragen. De
  site draait op GitHub Pages vanaf de root van `main`, dus een push is
  tegelijk de publicatie. Push als laatste stap van een taak, niet per losse
  edit, en meld de commit-hash in de samenvatting.
- **In een cloudsessie** krijgt Claude een eigen werkbranch toegewezen
  (bijvoorbeeld `main-xxxxxx`). Victor heeft uitdrukkelijk toestemming gegeven
  om daar niet op te blijven hangen: commit op de werkbranch, push die, en zet
  `main` daarna meteen gelijk met `git push origin <werkbranch>:main`. Dat moet
  een fast-forward zijn; lukt dat niet omdat `main` intussen verder staat, dan
  eerst `git fetch origin main` en `git merge origin/main`, nooit force-pushen.
  Pas na de push naar `main` staat de wijziging live. Geen pull request maken.
- **Cache-versie ophogen** bij elke wijziging aan `style.css`, `main.js` of
  `i18n.js`: de `?v=N` in `index.html` (regels 40 tot 42). Anders zien
  bezoekers de oude versie.
- **Alle tekst in Victors eigen schrijfstijl**: de site, beide cv's en de
  Engelse versie. Lees eerst [SCHRIJFSTIJL.md](SCHRIJFSTIJL.md). De
  kern: geen em-dashes (ook geen `&mdash;`), geen antithese-koppen, geen
  "van X tot Y", geen "niet X maar Y", geen aforismen. Zinnen hangen aan
  elkaar via `Dit`/`Deze`, voorbeelden openen met `Zo`, nuance via `doorgaans`,
  `al dan niet`, `vrij`. Feiten, cijfers en data blijven altijd ongewijzigd.
- **Kleine, gerichte wijzigingen.** Victor vraagt doorgaans om fijnafstelling,
  geen herontwerp. Grotere ingrepen eerst voorstellen.

## Grenzen

- **Geen sollicitatie-specifieke cv's in deze repo.** Die horen niet in een
  publieke repo; ze gaan als los bestand naar Victor.
- De `noindex`-metatags blijven staan. `robots.txt` laat crawlen bewust toe,
  zodat zoekmachines de `noindex` ook effectief lezen.
- De sectie **Referenties** blijft uitgecommentarieerd (zoek op
  `referenties` in `index.html`) tot Victor bevestigt dat de betrokkenen
  akkoord gaan. Geen contactgegevens van derden toevoegen.
- Nooit e-mails of berichten versturen zonder uitdrukkelijke toestemming.

## Hoe de code in elkaar zit (de valkuilen)

- **Vertalingen.** Nederlands staat inline in `index.html` met `data-i18n="sleutel"`.
  Engels staat in `window.I18N.en` in `i18n.js`, als template literals. Elke
  nieuwe zichtbare tekst krijgt dus een sleutel in beide bestanden, ook
  datums, plaatsnamen en skill-tags. `applyLang()` in `main.js` neemt bij de
  eerste wissel een momentopname van de Nederlandse innerHTML; daarna roept het
  `__syncRotator`, `__hertelGetallen` en `packSkillTags()` aan en stuurt het
  een `cv-layout`-event.
- **Tellers** (`data-count`): het eindgetal staat al in de html, zodat een
  bezoeker zonder javascript of een schermlezer nooit "0" leest. Getallen worden
  opgemaakt volgens de taal (14.716 / 14,716) via `toonGetal()` in `main.js`.
- **Intro-animatie**: `main.js` kloont de `h1` in `.intro-stage`, die daarom
  `aria-hidden="true"` draagt.
- **Regeleinden**: in de repo staat alles op LF. Op Victors Windows-machine
  staat `main.js` in de werkmap op CRLF, in de cloud is alles LF. Bij
  vervangingen met scripts rekening mee houden, en nooit bestanden in hun geheel
  van regeleinden laten wisselen.
- **Codecommentaar** is in het Nederlands en legt vaak uit *waarom* iets zo
  gebouwd is. Lees het voor je iets "opruimt".

## Bekijken en controleren

- Lokaal serveren: `python3 -m http.server 4322` (werkt overal),
  `npx serve -l 4321 .` (zie `.claude/launch.json`) of op Windows
  `powershell -ExecutionPolicy Bypass -File serve.ps1` (poort 5180).
- Controleer na een wijziging beide talen (knop `.lang-toggle`), op 1280 en
  375 pixels breed: geen horizontale overloop, geen fouten in de console.
- In een verborgen of headless browser lopen transities, `IntersectionObserver`
  en `requestAnimationFrame` vaak niet. Forceer dan `.reveal.in` om secties te
  zien en verwar dat niet met een bug.
- **In de cloud** staat Chromium klaar met Playwright (`/opt/pw-browsers`, nooit
  `playwright install` draaien). `tools/shot.js` maakt screenshots op 1280 en
  375 pixels en meldt consolefouten:
  `NODE_PATH=$(npm root -g) node tools/shot.js <uitmap> [tijdstippen in s]`.
  Met tijdstippen zet het alle animaties stil op die momenten, zodat je de
  intro beeld per beeld kunt bekijken; zonder tijdstippen neemt het de pagina
  na het laden. Zet de server eerst aan met `python3 -m http.server 4322`.
  Screenshots horen in de scratchpad, niet in de repo.

## De PDF's en de linkafbeelding

- `assets/cv-victor-van-sande.pdf` komt uit `cv-print.html`, en
  `assets/cv-victor-van-sande-ats.pdf` uit `cv-print-ats.html`. Ze lopen niet
  automatisch mee met de site: wie de inhoud van het cv aanpast, past beide
  html-bronnen aan en genereert beide PDF's opnieuw. Ze moeten op **2 pagina's**
  blijven.
  - Windows: headless Edge met `--headless=new --no-pdf-header-footer
    --print-to-pdf=<uit> file:///<bron>`.
  - Cloud: `/opt/pw-browsers/chromium-*/chrome-linux/chrome --headless=new
    --no-sandbox --no-pdf-header-footer --print-to-pdf=<uit> file://$PWD/<bron>`
    (getest, de dbus-foutmelding is onschuldig). Controleer met `pdftotext`:
    `pdftotext <pdf> - | tr -cd '\f' | wc -c` moet `2` geven.
  - Elders op Linux: hetzelfde met `chromium` of `google-chrome`. Is er geen
    browser, laat de PDF dan staan en meld aan Victor dat hij ze lokaal
    opnieuw moet laten genereren.
- `assets/og-image.jpg` komt uit `assets/og-source.html` via
  `assets/og-gen.ps1` (enkel Windows). In de cloud:
  `NODE_PATH=$(npm root -g) node tools/og.js` (getest, webfonts laden mee).
  Niet `chrome --screenshot` gebruiken: dat snijdt onderaan een strook af.
- **Favicon en app-icoon** (een witte V met een punt in de themakleur, zoals
  "Van Sande." in de hero): de bronnen zijn `assets/icons/favicon.svg`
  (afgeronde tegel) en `assets/icons/icon-full.svg` (vierkant, inhoud op 80 %
  zodat Android er een cirkel uit kan knippen). De png's ernaast komen uit
  `assets/icon-gen.ps1` (Windows). `main.js` (`zetFavicon`) kleurt het punt
  mee met het gekozen thema en bevat dezelfde vorm: wie de vorm aanpast, past
  ze op beide plaatsen aan. `manifest.webmanifest` verwijst naar de png's.

## Openstaande punten

Bekend bij Victor, nog niet beslist:

- De statistiek "40+ jaar motivatie" bovenaan valt uit de toon naast de drie
  feitelijke cijfers.
- Bij Fondsenwerver staat zowel een badge "Sinds sep 2026" als de datum
  "sep 2026 – heden".
- "ETMCQ + GCB-5" bij de masterproef is vakjargon.
- Een dertigtal afbeeldingen heeft geen `width`/`height`.
- De namen van de themakleuren mengen Engels en Nederlands ("Rood").
- Echt professioneel portfoliowerk (bijvoorbeeld uit Canva) toevoegen.
