# Werkafspraken voor Claude in deze repo

Dit bestand bundelt de afspraken die tot nu toe enkel in het lokale geheugen van
Claude stonden, zodat een sessie op een andere machine of in de cloud er
meteen mee verder kan. De repo is **publiek**: hier staat bewust niets dat niet
ook al op de site zelf te vinden is.

Over de site zelf (structuur, kleuren, hosten) gaat [README.md](README.md). Over
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
  `i18n.js`: de `?v=N` in `index.html` (regels 45 tot 47). Anders zien
  bezoekers de oude versie.
- **Alle tekst in Victors eigen schrijfstijl**: de site, beide cv's en de
  Engelse versie. Lees eerst [SCHRIJFSTIJL.md](SCHRIJFSTIJL.md). De
  kern: geen em-dashes (ook geen `&mdash;`), geen antithese-koppen, geen
  "van X tot Y", geen "niet X maar Y", geen aforismen. Zinnen hangen aan
  elkaar via `Dit`/`Deze`, voorbeelden openen met `Zo`, nuance via `doorgaans`,
  `al dan niet`, `vrij`. Feiten, cijfers en data blijven altijd ongewijzigd.
- **De PDF's altijd mee bijwerken.** Elke aanpassing aan de inhoud of de stijl
  van het cv (teksten, data, vertalingen, kleuren, vormen zoals de portretpil of
  de hoeken) gaat ook naar `cv-print.html`, `cv-print-en.html` en, voor de
  inhoud, `cv-print-ats.html`. Genereer daarna alle drie de PDF's opnieuw
  (`tools/pdf.js`, zie onderaan) en controleer dat ze op 2 bladen blijven. Ook de
  linkafbeelding (`assets/og-source.html`) volgt mee als naam, rol of stijl
  verandert. Meld in de samenvatting welke PDF's opnieuw gemaakt zijn.
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
  `hertelGetallen()` aan en stuurt het een `cv-layout`-event (dat het
  voorproefvenster gebruikt om zijn zinnen mee te vertalen).
- **Tellers** (`data-count`): het eindgetal staat al in de html, zodat een
  bezoeker zonder javascript of een schermlezer nooit "0" leest. Bij het in beeld
  komen klapt elk cijfer willekeurig door alle cijfers en landt dan, van links
  naar rechts, zoals een oud vertrekbord; ook `data-flap` (voor 18–65 en 2):
  `main.js` splitst elk getal in `.tel-sr` (eindgetal voor schermlezers),
  `.tel-maat` (houdt de breedte vast) en `.tel-live` (aria-hidden, telt op).
  `hertelGetallen()` zet het scheidingsteken volgens de taal (14.716 / 14,716).
- **Het vel papier** (`vel.js`, sinds nov 2026): bij het eerste bezoek in een
  sessie ligt een vel papier over de site waarop "Victor Van Sande - CV" getypt
  wordt in Special Elite met een inktfilter (`#vel-inkt` in `index.html`). Het
  vel veeg je omhoog weg (ook scrollen, Enter, spatie, pijltjes), en de site
  eronder stelt scherp via een `backdrop-filter`-laag (`.vel-waas`, `--vp`).
  Het inlinescript in de head zet `vel-open` al voor de eerste paint (anders zie
  je eerst even de site); de waas staat enkel aan terwijl het vel beweegt
  (`vel-los`), want een backdrop-filter onder een bewegend vel deed het typen
  haperen; ze heeft een vaste blur die uitfadet (opacity), geen blur die elk
  beeld verandert. De cursor schuift achter de laatst getypte letter mee. Geen geluid: browsers laten dat pas toe na een eerste klik, dus het typen
  bleef voor de meeste bezoekers stil (bewust weggelaten). Het
  vel volgt de vinger 1-op-1 en gaat na het loslaten verder met de snelheid
  van de veeg (gemeten over de laatste 80 ms). Onderaan staat de hint "veeg omhoog" als maatlat (`.vel-lat`: zeven streepjes die van onder naar boven oplichten, tekst in Special Elite). Rechtsboven op
  het vel kies je meteen licht of donker (`.vel-keuze`): het vel volgt mee en de
  keuze geldt voor de hele site (`cv-modus`). Het papier heeft een fijne korrel
  en licht reliëf (`.vel::before`, feDiffuseLighting).
  `vel.js` laadt voor `main.js` en zet `window.__velWeg`; de Venster-intro
  start pas als die belofte afgaat. Geen vel bij minder beweging, in de
  compacte weergave of bij een herbezoek in dezelfde sessie.
- **Intro-animatie "Venster"** (sinds nov 2026, vervangt de regenboogintro):
  eenmaal per sessie (`sessionStorage` `vvs-intro-seen`, klasse `intro` op
  `<html>`). De echte `h1.hero-name` staat eerst groot over het scherm met de
  zonsverduistering in de letters en krimpt dan naar zijn plaats; de rest van
  de hero komt erbij. De css staat in `style.css` onder "Intro Venster",
  de startpoort en de beginstand per schermmaat (`--vs`, `--vtx`, `--vty`) in
  `main.js`. Er wordt niets gekloond. Na de intro schuift er één lichtglans over de naam;
  de naam staat zonder kerning (`font-kerning: none`), anders verspringt hij
  bij het opsplitsen. De portretpil wordt voor de intro al geplaatst
  (`__pilVoorIntro`) en ontvouwt zich naast "Victor" zodra de naam geland is.
  Daarna worden de letters opgesplitst en is de naam gewone tekst in de
  inktkleur (`.gesplitst`): WebKit (iPhone) tekent background-clip: text niet
  door in inline-block letters, en dan was de naam onzichtbaar. Daarna
  is de naam bij hover een Tech Text (eigen bouw naar React Bits): de
  letter onder de cursor wordt een lijnletter met een glijdend kader en label,
  een klik laat letters opspringen. De heroknoppen krijgen bij hover een
  korrelig verloop ("Grainient", css onder die naam). Rechts van "Victor" staat een
  pil met het portret (`.hero-pil`, `assets/victor-profiel.jpg`): main.js meet de
  regels van de naam en de hoogte van een hoofdletter, en zet de pil zo dat ze
  even hoog is als de hoofdletters en eindigt waar "Sande" eindigt; de trefwoorden
  (`.tags span`) krijgen bij hover hetzelfde, in het accent van hun sectie.
- **Ontwerp (sinds nov 2026, richting "Gegradeerd")**: elke sectie opent met een
  eigen foto in breedbeeld en haalt haar kleuren uit die foto, via de klassen
  `.g-*` bovenaan `style.css` (achtergrond = donkerste tint, accent = heldere
  tint). De masterproef is een eigen blok binnen Opleiding, met het gespiegelde MAS op
  zijn zij (een knipoog naar misinformatie), een avondblauwe achtergrond uit de
  lucht en een terracotta accent uit de baksteen (`.g-urbex`, de naam is gebleven). Over mij opent met de Amsterdamse grachtenpanden op film (`.g-gracht`). De
  zwart-witfoto van de fondsenwerving staat klein bij Gekkoo (`.org-foto`). Nieuwe foto's gaan op 1600 pixels en zonder
  metadata (geen GPS) in `assets/photos/`, met een webp-versie van 1080 px in
  `assets/photos/m/` die enkel op gsm laadt (`<picture>` met
  `media="(max-width: 700px)"`; de pc krijgt altijd het origineel). `picture`
  staat op `display: contents`, de `source` op `display: none`. Er is geen vrij kleurthema meer: dat zou dat systeem doorkruisen.
  Wel een lichte versie (knop `.mode-toggle` in de menubalk, `data-mode="light"`
  op `<html>`): per sectie een lichte tint uit dezelfde foto en een dieper
  accent. De keuze staat in `localStorage` onder `cv-modus`, bewust niet onder
  het oude `cv-mode` van `v1/`, waar licht de standaard was. Standaard donker.
  Wie een nieuw palet `.g-*` toevoegt, voegt ook de lichte tegenhanger toe. Weinig beweging: enkel de intro en hovers. Alles staat open,
  behalve de twee galerijen (werk en fotografie): die zijn op Victors vraag een
  `<details class="fold">` met als voorproef een waaier van zes overlappende,
  licht gedraaide kaartjes (`.peek-kaart`, `--i`), die bij hover verder openwaaiert.
  Geen secties die pas bij het scrollen verschijnen. De sectietitels vullen de linkerkolom
  (`.sec-head`, 4 van de 12 kolommen); een titel van twee regels krijgt
  `.sec-title-lang` (kleiner, zodat hij ruim wegblijft van de tekst ernaast).
  Sectietitels krimpen in main.js (`pasTitels`) tot er 36 px vrij blijft tot de
  rechterkolom, zodat ook langere Engelse woorden passen. De grote foto's
  hebben hoeken van 12 px; op gsm onder 700 px lopen ze van rand tot rand,
  zonder hoeken. De gekleurde lagen die er vroeger rechts onder uitschoven
  (naar de Staggered Menu) zijn op Victors vraag weg. Een kop binnen een sectie (`.sub-head >
  .sec-sub`, Wat me drijft) staat in de titelletter, kleiner dan de sectietitel.
  Hoeken volgen één schaal (`--r-xs` 4, `--r-s` 6, `--r-m` 10, `--r-l` 12,
  `--r-xl` 16 px, bovenaan `style.css`): trefwoorden xs, knoppen s, kleine beelden
  en zwevende knoppen m, grote foto's en galerijkaarten l, compacte kaarten xl. Bewuste
  uitzonderingen: de schakelaars (pil), de printer en zijn gleuf, de meetlat. Geen
  volledig ronde pillen (ook het portret is een afgeronde rechthoek, hoeken 14 %
  van de hoogte via `--pr`; ook in de PDF's en de linkafbeelding).
  Open- en dichtklappen glijdt (main.js, "Uitklappen van de galerijen": hoogte, galerij fadet in, waaier schuift samen; 420 ms open, 300 ms dicht). Op gsm toont de fotogalerij een teller ("3 / 23") in plaats van de streepjes.
- **Schuifknop om te printen** (`.schuif` bij het bonnetje, naar de Slide to
  Confirm van Kokonut UI): één element in drie standen (`data-staat`). `rust`:
  de greep sleep je naar rechts (voorbij 90 % start de printer; een klik geeft
  een duwtje, Enter of spatie print meteen). `print`: een balk loopt gelijk op
  met het papier, met de Lattice Loader van React Bits (orbit, raster 3, met
  timer, groen vinkje "Klaar in 2,4s"; css ongewijzigd uit de bron, markup in
  `bonnetje.js`). `bewaar`: de schuif krimpt tot de downloadknop (breedte via
  `--w`). Na het afscheuren groeit hij terug tot de schuif.
- **Glaslens** (`glas.js`, naar de Liquid Glass van Aceternity UI, omgezet naar
  gewone javascript): boven een grote foto (`.frame img`) groeit de cursor uit
  een punt tot een lens van 132 px die de foto breekt (verplaatsingskaart als
  SVG-filter in een backdrop-filter). Enkel Chromium breekt echt; Safari en
  Firefox krijgen mat glas (`.glas-mat`). Enkel met een muis, niet tijdens het
  vel of in de compacte weergave, niet bij `prefers-reduced-transparency`.
- **Galerijen** (`galerij.js`, eigen bouw, geïnspireerd op React Bits Pro maar
  zonder hun code): de fotogalerij wordt een oneindige lenticulaire carrousel (kaart draait
  strook per strook om bij hover; elke kaart staat op `--x`, rond gerekend over de reeks; achterkant met titel en bijschrift uit
  `.design-cap`), de werkgalerij een draaiende ring met bewegingsonscherpte. Zonder
  script blijven de rasters staan. Een klik op een kaart opzij wordt in de
  capture-fase onderschept; de middelste kaart opent de lichtbak of het
  voorproefvenster zoals voorheen. Cache-versie van `galerij.js` staat naast de
  andere in `index.html`.
- **Compacte weergave** (`stapel.js`, eigen bouw naar de Scroll Stack van React
  Bits Pro): de hele site als stapel kaarten, één per onderdeel, met de foto en
  het palet van dat onderdeel. Aan via de instellingen (`data-view="compact"` op
  `<html>`, onthouden onder `cv-weergave`). De kaarten staan als gewone html in
  `#compact` en hergebruiken bestaande vertaalsleutels; wie een onderdeel
  toevoegt of hernoemt, past ook de kaart aan. "Lees verder" zet de gewone
  weergave terug en springt naar de sectie. Extra knoppen (cv, mail) staan als rond
  icoon rechtsboven in het accent van de kaart (`.stack-hoek`), met een label
  dat openschuift bij hover. Elke kaart is om te draaien
  ("Draai om"); de achterkant is een kopie van de echte inhoud van dat
  onderdeel (`ACHTER` in `stapel.js`), opnieuw gekopieerd na een taalwissel. Geen intro in compacte weergave.
- **Snapshot op een bonnetje** (`bonnetje.js`, eigen bouw naar de Receipt Printer
  van React Bits Pro): onderaan Contact print een printer de kern van het cv op
  een canvas-bonnetje, te bewaren als PNG of af te scheuren door het opzij
  of omhoog te trekken (opzij draait het rond de hoek bij de gleuf, eigen ontwerp). De inhoud komt uit `.essentie .facts` en de contactgegevens in het
  script; wie de essentie aanpast, past dus ook het bonnetje aan. Het bonnetje
  rolt over de site erboven (het vak neemt geen plaats in), dus er verschuift niets. Eén knop print het
  bonnetje en wordt daarna "Bewaar als afbeelding"; afscheuren zet hem terug. Hij
  heeft een bel-animatie en wisselend label (`.bel`, labels als sjablonen). Lettertype:
  IBM Plex Mono. In de kast staat gegraveerd "CV Printer 9000" (`.snap-merk`). In de
  streepjescode zit een easter egg: "VVS" uitgespaard in een dicht blok balkjes.
- **Overgang tussen secties**: `vloei()` in `main.js` geeft elke sectie de
  achtergrondkleur van de sectie erboven mee (`--vorige`, klasse `.vloeit`),
  zodat ze bovenaan zacht in elkaar overvloeien. Herberekend bij een wissel
  tussen licht en donker.
- **Duur bij periodes**: elke periode staat in een `.row-when` met
  `data-periode="2019-09/2026-09"` (of `/nu`, of enkel een jaartal). `zetDuur()`
  in `main.js` rekent daaruit de duur ("7 jaar", "2 mnd") en zet die eronder.
  Wie een datum aanpast, past ook `data-periode` aan.
- **Vorige versie**: de site van voor de herwerking staat ongewijzigd in `v1/`
  (niet meer gelinkt vanuit de site, wel bereikbaar via `v1/`). Niet meer aanpassen, enkel bewaren.
- **Regeleinden**: in de repo staat alles op LF. Op Victors Windows-machine
  staat `main.js` in de werkmap op CRLF, in de cloud is alles LF. Bij
  vervangingen met scripts rekening mee houden, en nooit bestanden in hun geheel
  van regeleinden laten wisselen.
- **Menubalk**: glas (backdrop-filter blur en saturate over een halfdoorzichtige
  tint, lichtrand bovenaan), met de bijna dekkende balk als terugval.
- **Raakvlakken**: kleine knoppen (menubalk, galerij, diploma's) krijgen een
  onzichtbare `::after` rond zich, zodat ze 44 px hoog zijn zonder er anders uit
  te zien (css onderaan "Toegankelijkheid zonder zichtbaar verschil"). `404.html`
  laadt `style.css` met dezelfde `?v=N` als `index.html`: mee ophogen.
- **Strepen**: geen lijn onder het laatste item van een opsomming (css onderaan
  "Geen streep na het laatste item"); wie een nieuwe lijst met lijnen toevoegt, volgt dat.
- **Talen** (`.langs` bij Over mij): per taal een begroeting in die taal in de
  titelletter (`.taal-groet`, aria-hidden; Hallo, Hi there, Bonjour) met de
  taalnaam eronder, en een meetlat in zes stappen voor A1 tot C2 (`.taal-lat`,
  `--n` = behaalde stappen).
- **Trefwoorden** (`.tags span`) staan zonder hekje. Beide galerijen vervagen
  links en rechts (mask-image).
- **Beschrijvingen voor schermlezers**: de Engelse alt-teksten staan per
  bestandsnaam in `I18N.enAlt`, de Engelse labels van knoppen zonder tekst in
  `I18N.enAria` (onderaan `i18n.js`); `vertaalLabels()` in `main.js` zet ze bij
  een taalwissel. Wie een foto of icoonknop toevoegt, vult die lijsten aan.
- **Altijd in beide talen testen**: een `data-i18n` op een element met geneste
  opmaak (zoals een badge) verliest die in het Engels; zet de sleutel dan op een
  eigen span.
- **Codecommentaar** is in het Nederlands en legt vaak uit *waarom* iets zo
  gebouwd is. Lees het voor je iets "opruimt".

## Bekijken en controleren

- Lokaal serveren: `python3 -m http.server 4322` (werkt overal),
  `npx serve -l 4321 .` (zie `.claude/launch.json`) of op Windows
  `powershell -ExecutionPolicy Bypass -File serve.ps1` (poort 5180).
- Controleer na een wijziging beide talen (knop `.lang-toggle`) en beide
  versies (knop `.mode-toggle`), op 1280 en 375 pixels breed: geen horizontale overloop, geen fouten in de console.
- In een headless browser laden afbeeldingen met `loading="lazy"` pas als je
  erlangs scrolt; een volledige screenshot zonder scrollen toont dus lege
  vakken. Dat is geen bug.
- **In de cloud** staat Chromium klaar met Playwright (`/opt/pw-browsers`, nooit
  `playwright install` draaien). `tools/shot.js` maakt screenshots op 1280 en
  375 pixels en meldt consolefouten:
  `NODE_PATH=$(npm root -g) node tools/shot.js <uitmap> [tijdstippen in s]`.
  Met tijdstippen zet het alle animaties stil op die momenten, zodat je de
  intro beeld per beeld kunt bekijken; zonder tijdstippen neemt het de pagina
  na het laden. Zet de server eerst aan met `python3 -m http.server 4322`.
  Screenshots horen in de scratchpad, niet in de repo.

## De PDF's en de linkafbeelding

- `assets/cv-victor-van-sande-en.pdf` komt uit `cv-print-en.html` (Engelse
  versie van `cv-print.html`; wie de inhoud aanpast, past beide aan). De
  downloadknoppen wisselen mee met de taal (`applyLang()` in `main.js`).
- `assets/cv-victor-van-sande.pdf` komt uit `cv-print.html`, en
  `assets/cv-victor-van-sande-ats.pdf` uit `cv-print-ats.html`. Ze lopen niet
  automatisch mee met de site: wie de inhoud van het cv aanpast, past beide
  html-bronnen aan en genereert beide PDF's opnieuw. Ze moeten op **2 pagina's**
  blijven.
  - Windows: headless Edge met `--headless=new --no-pdf-header-footer
    --print-to-pdf=<uit> file:///<bron>`.
  - Cloud: `NODE_PATH=$(npm root -g) node tools/pdf.js [bron.html uit.pdf]`
    (zonder argumenten: `cv-print.html` naar `assets/cv-victor-van-sande.pdf`).
    Dat wacht op de webfonts; `chrome --print-to-pdf` doet dat niet, en sinds
    `cv-print.html` Big Shoulders en Libre Franklin gebruikt is dat nodig.
    Controleer met `pdftotext`: `pdftotext <pdf> - | tr -cd '\f' | wc -c` moet
    `2` geven, en kijk of het laatste item van de zijkolom op blad 1 er nog staat
    (blad 1 heeft `overflow: hidden`, dus wat niet past valt stil weg).
  - `cv-print.html` volgt sinds nov 2026 de stijl van de site, op wit papier.
    De vorige PDF en haar bron staan in `v1/` en horen bij de archiefversie.
  - Elders op Linux: hetzelfde met `chromium` of `google-chrome`. Is er geen
    browser, laat de PDF dan staan en meld aan Victor dat hij ze lokaal
    opnieuw moet laten genereren.
- `assets/og-image.jpg` (sinds nov 2026 in de stijl van de site: zwart, naam
  met portretpil, zonsverduistering rechts) komt uit `assets/og-source.html` via
  `assets/og-gen.ps1` (enkel Windows). In de cloud:
  `NODE_PATH=$(npm root -g) node tools/og.js` (getest, webfonts laden mee).
  Niet `chrome --screenshot` gebruiken: dat snijdt onderaan een strook af.
- **Favicon en app-icoon** (sinds nov 2026): "VVS" in Big Shoulders Display 800,
  gevuld met het verloop van de zonsverduistering, op bijna zwart (#0c0a0a). De
  letters staan als paden in de svg (geen webfont nodig), het verloop zit op een
  rechthoek met de letters als masker. Bronnen: `assets/icons/favicon.svg`
  (afgeronde tegel) en `assets/icons/icon-full.svg` (vierkant, inhoud op 64 %
  zodat Android er een cirkel uit kan knippen). De png's (32, 180, 192, 512)
  zijn in de cloud met Playwright uit die svg's gerenderd; `assets/icon-gen.ps1`
  doet hetzelfde op Windows.

## Openstaande punten

Bekend bij Victor, nog niet beslist:

- Bij Fondsenwerver staat zowel een badge "Sinds sep 2026" als de datum
  "sep 2026 – heden".
- Echt professioneel portfoliowerk (bijvoorbeeld uit Canva) toevoegen.
