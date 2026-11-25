# Ontwerpregels van de site

Dit is het regelboek van de site: welke keuzes er gemaakt zijn en waarom, wat al
geprobeerd en afgewezen is, en wat er allemaal mee moet veranderen bij een
aanpassing. Het groeit mee: elke nieuwe beslissing komt hier bij, met de reden.

[CLAUDE.md](CLAUDE.md) legt uit hoe de code werkt en waar de valkuilen zitten,
[SCHRIJFSTIJL.md](SCHRIJFSTIJL.md) gaat over de teksten. Dit bestand gaat over
het ontwerp en over de stappen bij een wijziging.

## 1. Smaak en richting

- **Minimaal en smaakvol.** Victor zoekt fijnafstelling, geen spektakel.
  Effecten die opvallen om op te vallen gaan eruit: de glaslens over de foto's
  was "te extra", de speelse hovers voor de trefwoorden (vetpotlood, stempel,
  vertrekbord, typemachine) waren "te speels", de eerste reeks eenvoudige
  hovers voelde "vibecoded".
- **Rustige, gemoedelijke kleuren.** Elk hoofdstuk haalt zijn kleuren uit zijn
  eigen foto ("Gegradeerd"). Verzadigde kleuren botsen met de rest: een violet
  voor Opleiding werd meteen afgewezen.
- **Beweging enkel waar ze iets betekent.** Een animatie belooft een actie. Wat
  niet klikbaar is, beweegt dus niet.
- **Elk detail volgt het hoofdstuk.** Knoppen, het lijntje in de menubalk, de
  voortgangsbalk en de scrollbalk van de compacte weergave nemen het accent over
  van het hoofdstuk waartoe ze horen.
- **Eerst tonen, dan kiezen.** Bij een keuze over kleur of vorm worden de
  opties naast elkaar op de echte site getoond (screenshots of een proefpagina),
  niet in woorden beschreven.

- **Lengte** (feedback van collega's, nov 2026: "heel lang"). Gemeten nemen de
  acht grote foto's ruim een derde van de site in (4,5 van 12,6 schermen op de
  pc); de dubbele tekst maar 1,5 %. Toch blijven de foto's zoals ze zijn: **de
  grote foto's worden niet lager gemaakt** (Victors keuze, ze dragen het
  ontwerp). Lengte winnen gebeurt dus enkel met inhoud. Geschrapt: de tegels
  "2 gevalideerde vragenlijsten" en "14.716 woorden" bij de masterproef (site
  en PDF's; de vragenlijsten staan nog in de tekst van de PDF's).
  Daarna ook alle dubbele tekst: de badge "Sinds sep 2026" bij Fondsenwerver
  (de datum staat ernaast), de inleiding en de eerste alinea van Over mij
  (herhaalden Opleiding en het leiderschap bij KSA), de kaart KSA in "Wat me
  drijft" en "Fotografie" en "Nieuwe technologie" in "En verder nog" (stonden
  er al als kaart), de vakjes Beschikbaarheid en EHBO in "In één oogopslag"
  (staan in de hero, Contact en Opleiding) en de inleiding van Ervaring
  (herhaalde Werk). Regel: elk gegeven staat één keer op de site, buiten de
  samenvatting bovenaan. "In één oogopslag" heeft nu zes vakjes in drie
  kolommen, "Wat me drijft" drie kaarten.
  Daarna kwam er bij Ervaring en Over mij toch weer een korte inleiding (Victors
  vraag, nov 2026): zonder stond de ondertitel er alleen naast de grote titel,
  en dat oogde leeg. Elk hoofdstuk heeft nu **titel, ondertitel en een korte
  inleiding**. Die inleiding herhaalt niets uit het hoofdstuk zelf: ze zegt
  waarover het gaat of legt een verband (bij Ervaring: werk rond kinderen en
  jongeren; bij Over mij: waarom er zoveel foto's op de site staan). KSA (een
  label in plaats van een ondertitel) en Contact (een eigen slot) wijken af.

- **Lint onder Contact** (nov 2026, Victors vraag): een lopende band met
  "Laten we samenwerken" sluit de site af, in het palet van Contact. Uit vier
  voorstellen koos Victor A (golvende band in het accent, naar de TextLoop van
  React Bits). Niet gekozen: B (twee gekruiste banden in tegengestelde
  richting), C (grote lijnletters zonder band) en D (smalle rechte naad met
  lijnen). Dit is een bewuste uitzondering op "weinig beweging": de enige
  animatie die vanzelf blijft lopen. Daarom traag (38 px/s), stil bij hover en
  bij minder beweging, en enkel actief in beeld.

- **"Weinig tijd? Lees de compacte versie"** (nov 2026, Victors vraag): een
  stille tekstlink onder de twee knoppen in de hero, geen derde knop, zodat de
  knoppen hun gewicht houden. Zelfde werking als de schakelaar in de instellingen.
- **Foto in de hero** staat op `object-position: 50% 64%`: de sikkel zit onder
  het midden van de foto. De hele zon past niet in het kader op de pc zonder in
  te zoomen (Victor wil geen kwaliteitsverlies) of het kader hoger te maken.

- **De printer met het bonnetje** (nov 2026) is op Victors vraag uit de site
  gehaald: de site eindigt met Contact. Het blok staat in `bewaard/bonnetje.md`,
  met de stappen om het terug te zetten; `bonnetje.js` en de css blijven staan.

- **Referenties** (nov 2026): geen eigen sectie, want die nam plaats in. In de
  plaats een knop bij de rol waar ze bij horen, die een venster opent in het
  palet van dat hoofdstuk (zie hoofdstuk 4). Eerst stond er een uitgecommentarieerd
  blok, maar dat was publiek leesbaar in de paginabron en Victor had er niet om
  gevraagd. Een referentie verandert nooit zonder zijn vraag.

## 2. Volgorde van de hoofdstukken

Portfolio, Ervaring (Gekkoo), Opleiding met de masterproef, Over mij, KSA Herentals,
Contact.

- Opleiding staat voor KSA omdat de opleidingen voor een werkgever relevanter
  zijn dan het jeugdwerk (feedback, nov 2026). Gekkoo blijft eerst als huidige job.
- Over mij staat voor KSA (Victors keuze, nov 2026).
- Het eerste hoofdstuk heet "Portfolio" (nov 2026). Eerst heette het "Werk", wat
  verwarde: Victors job bij Gekkoo staat onder "Ervaring". Het toont vakgebieden en
  werkstukken; in het Engels heette het al "Portfolio". De id blijft `#werk`.
- KSA staat niet in het menu en heeft een eigen blok (`div.sec#ksa`).
- In de PDF's: Ervaring en Opleiding op blad 1, masterproef en Vrijwilligerswerk
  (KSA) op blad 2. In de ATS-versie staat KSA onder Vrijwilligerswerk, na de masterproef.

## 3. Kleuren per hoofdstuk

Elk palet staat in `style.css` als `.g-*` (donker) met een lichte tegenhanger
onder `:root[data-mode="light"]`. Donker: de achtergrond is de donkerste tint uit
de foto, het accent een heldere tint. Licht: een lichte tint uit dezelfde foto,
met een dieper accent. In de PDF's staat het accent als `--a-*` in
`cv-print.html` en `cv-print-en.html`.

| Hoofdstuk | Palet | Foto | Accent donker | Accent licht | PDF |
|---|---|---|---|---|---|
| Hero | `g-eclipse` | zonsverduistering | `#e0a870` goud, tweede accent `#d75363` karmijn | `#9b6026`, karmijn `#a3203a` | `#9a6430` |
| Portfolio | `g-schelde` | antwerpen-skyline-schelde | `#a7bccd` staalblauw | `#3a546a` | `#3f5568` |
| Ervaring (Gekkoo) | `g-theater` | theaterzaal-rood-licht | `#f56167` rood | `#ab2833` | `#a8323a` |
| Opleiding | `g-centraal` | antwerpen-centraal-vensters | `#7fb8b8` petrol | `#2c6a6c` | `#2c6a6c` |
| Masterproef | `g-urbex` | mas-spiegeling | `#eb8762` terracotta | `#a74221` | `#a74221` |
| Over mij | `g-gracht` | amsterdam-grachtenpanden-film | `#f08aa0` roze | `#b23a5a` | geen |
| KSA Herentals | `g-herfst` | herfstbos-contrast | `#e4a55b` amber | `#925614` | `#8f5a1e` |
| Contact | `g-veld` | drone-zonsondergang-kampeerveld | `#f0d4ac` crème | `#506e28` groen | geen |

- **Opleiding is petrol** (nov 2026): het enige gat in het kleurenwiel tussen het
  groen van Contact en het blauw van Portfolio, en het staat tegenover het goudlicht
  in de foto, waardoor de foto gloeit. Geprobeerd en afgewezen: violet (botst),
  een gedempt grijslila "heide" (zelfde familie als violet), het oude steenbeige
  (saai, te dicht bij het roze van Over mij).
- **Karmijn in de hero** (nov 2026): Victors lievelingskleur is rood. Als tweede
  accent naast het goud (`--g-acc2`), in een analoge harmonie: in OKLCH karmijn op
  16° en het goud op 65°, het rood dieper (helderheid 0,62 tegenover 0,77), zodat
  het goud de hoofdkleur blijft. Gekozen uit drie: corona-rood (40°, uit de foto,
  te oranje), granaat (28°) en karmijn (16°, Victors keuze, het dichtst bij zijn
  rood-roze). Enkel in de heroknoppen (verloop van karmijn naar goud), de nummers
  van "In één oogopslag" en het kader van de Tech Text op de naam (Victors vraag,
  eerst was dat goud); spaarzaam houden, anders verliest het zijn kracht. Niet
  in de PDF's, omdat die knoppen en nummers daar niet staan.
- Het ongebruikte palet `g-bos` (violet met olijf) is in nov 2026 uit `style.css` gehaald.
- Een nieuw palet moet duidelijk verschillen van deze tabel, in tint en niet
  enkel in helderheid.

## 4. Interactie: wat beweegt en wat niet

| Element | Gedrag | Waarom |
|---|---|---|
| Klikbare knoppen (`.btn`, `.doc-btn`, `.gal-btn`, `.stack-hoek a`, `.ref-citeer`) | Grainient bij hover: een korrelig verloop uit tinten van het accent van het hoofdstuk, de lichtste vlek volgt de cursor | Een knop mag tonen dat hij iets doet |
| Trefwoorden (`.tags span`) | "Stil": tekst naar inktkleur, rand naar 55 % accent, zonder overgang | Labels, geen knoppen; beweging zou een klik beloven |
| Menubalk | Geen Grainient; het lijntje onder het hoofdstuk in beeld krijgt het accent van dat hoofdstuk | Hoort bij geen enkel hoofdstuk |
| Grote foto's, met muis | In rust licht gedempt; bij hover valt de gradering weg en zoomt de foto 2 % | Vervangt de glaslens, die te veel aandacht trok |
| Grote foto's, zonder muis | Volle kleur in het midden van het scherm, geleidelijk gedempt naar de rand | Op een gsm is er geen hover |
| Hint op het vel (typemachine) | Een dun pijltje naar boven dat traag op en neer deint, zonder tekst (de tekst blijft voor schermlezers) | Suggereert het vegen zonder het te benoemen; eerder stonden er een maatlat van streepjes en "veeg omhoog" |
| Bonnetje na het afscheuren (bewaard, niet op de site) | Vouwt tot een prop met facetten, licht en schaduw, en valt weg (naar de Paper Crumple van React Bits) | Het afscheuren krijgt een tastbaar einde |
| Lint onder Contact | Loopt traag (38 px/s) langs een golf, volgt de vinger bij slepen en loopt dan met die vaart verder, staat stil bij hover | Een uitnodiging om af te sluiten; de enige beweging die vanzelf loopt |
| Naam na de intro | Geen lichtglans meer; de letters landen en blijven staan | De korte witte gloed op het einde was overbodig |
| Knoppen naar de referenties | Gewone `.doc-btn` met een sterretje in lijn voor het woord "Referentie(s)": wit op donker, het accent op licht, verticaal op het midden van de kleine letters (2 px lager dan het tekstvak) | Subtiel, maar te herkennen als iets bijzonders |
| Venster met referenties | Lijst met initialen, naam, functie en contact; bij wie een citaat heeft een gevulde knop "Toon citaat" die omklapt naar "Verberg citaat" | Alles te raadplegen zonder extra lengte op de pagina |
| Compacte kaarten | Klikken vast in focus; klik naast de kaart draait haar om (naar die kant); eigen scrollbalk op de achterkant | Makkelijk scherp krijgen, minder knoppen nodig |

- Knoppen en randen: snel in (140 ms), trager uit (300 tot 320 ms), easing
  `cubic-bezier(.2, 0, 0, 1)`. De gradering van de foto's is bewust traag (0,9 tot 1,2 s).
- Elke animatie heeft een variant voor minder beweging.
- Elk gebaar heeft een alternatief met een klik of toets (galerij: pijltjes;
  vel: Enter en pijltjes; bonnetje: pijltjes, Delete, Escape; kaart: "Draai om").

## 5. Vormen en maten

- **Sectiekoppen:** titel en tekst ernaast staan op elkaar uitgelijnd: de
  bovenkant van de hoofdletters op dezelfde hoogte, en waar de tekst korter is,
  de laatste regel op de onderlijn van de titel (Victors vraag, nov 2026).

- Hoeken volgen één schaal (`--r-xs` 4 tot `--r-xl` 16 px). Geen volledig ronde
  pillen, ook het portret niet.
- Kleine knoppen hebben een onzichtbaar raakvlak van 44 px.
- Geen streep onder het laatste item van een lijst, behalve waar die streep een
  functie heeft (het lijntje onder Contact in de menubalk).
- Koppen slaan geen niveau over: h1 de naam, h2 de hoofdstukken, h3 daaronder.
- Scrollbalken in eigen ontwerp: een fijne lijn met een kapsule in het accent,
  zonder pijltjes (achterkant van de compacte kaarten).

## 6. Stappenlijsten bij een wijziging

### Een foto van een hoofdstuk vervangen

1. **Bestanden.** Origineel op 1600 px breed, zonder metadata (geen GPS), in
   `assets/photos/`. Een webp van 1080 px met dezelfde naam in `assets/photos/m/`
   (enkel voor gsm).
2. **Op de site** (`index.html`): de foto bovenaan het hoofdstuk (`.frame`), de
   kaart in de compacte weergave (`#compact`), en als de foto ook in de
   fotogalerij of de waaier staat ook daar (`.fold-peek`, `.diploma-thumb`).
   Pas de bron (`src`, `srcset`, `data-full`) en de `width`/`height` aan.
   Kijk of de uitsnede nog klopt (`object-position`).
3. **Beschrijving.** Nederlandse `alt` in `index.html`, Engelse in `I18N.enAlt` in
   `i18n.js` (op bestandsnaam). Het bijschrift (`figcaption`) heeft een sleutel in
   beide talen.
4. **Palet.** Een andere foto betekent doorgaans andere kleuren. Haal achtergrond
   en accent uit de nieuwe foto (stappenlijst hieronder) en toets ze aan de tabel
   in hoofdstuk 3.
5. **PDF's.** Opleiding: de foto staat als band bovenaan blad 2. Hero: als band op
   blad 1. Pas `cv-print.html` en `cv-print-en.html` aan en maak de PDF's opnieuw.
6. **Linkafbeelding.** Enkel voor de hero (zonsverduistering): `assets/og-source.html`
   en daarna `tools/og.js`.
7. **Deze tabel** (hoofdstuk 3) bijwerken.

### Het palet van een hoofdstuk wijzigen

1. Toon eerst twee of drie opties op de echte sectie, in licht en donker, met de
   overgang vanuit het hoofdstuk erboven.
2. `style.css`: de `.g-*` regel (donker) en de lichte tegenhanger, alle zes de
   waarden (`--g-bg`, `--g-ink`, `--g-soft`, `--g-dim`, `--g-line`, `--g-acc`).
3. PDF's: `--a-*` in `cv-print.html` en `cv-print-en.html`, daarna beide opnieuw
   genereren (2 bladen). De ATS-versie heeft geen kleur.
4. Volgt vanzelf: de compacte kaart, de overgang tussen hoofdstukken, het lijntje
   in de menubalk, de voortgangsbalk, de Grainient van de knoppen.
5. Hoofdstuk 3 van dit bestand bijwerken, met de reden en wat afgewezen is.

### Een hoofdstuk toevoegen, verplaatsen of hernoemen

1. `index.html`: het blok zelf, het menu (`.nav-links`) als het daarin hoort, en
   de kaart in `#compact` op dezelfde plaats in de volgorde.
2. `stapel.js`: de achterkant van de kaart (`ACHTER`).
3. Vertalingen: elke zichtbare tekst een sleutel in `index.html` en `i18n.js`.
4. Een nieuw palet: zie hierboven, met een lichte tegenhanger.
5. PDF's (alle drie) als de volgorde of inhoud van het cv verandert.
6. Hoofdstuk 2 van dit bestand en de volgorde in CLAUDE.md bijwerken.

### De inhoud van het cv aanpassen (teksten, data, functies)

1. Site in het Nederlands (`index.html`) en in het Engels (`i18n.js`), in Victors
   schrijfstijl. Feiten en cijfers ongewijzigd laten tenzij Victor ze aanpast.
2. Een datum: ook `data-periode` op de `.row-when` (de duur wordt berekend).
3. De essentie bovenaan (`.essentie .facts`) voedde ook het bonnetje (nu bewaard, zie `bewaard/bonnetje.md`).
4. De kaart in de compacte weergave als die tekst daar ook staat.
5. Alle drie de PDF's en, bij naam of rol, de linkafbeelding.

### Een knop toevoegen

- Gebruik `.btn` (of `.btn-line`). Een ander soort knop die klikbaar is, komt in
  de lijst van de Grainient (`style.css`) en in de cursorvlek (`main.js`).
- Een knop met enkel een icoon krijgt een `aria-label` in beide talen (`I18N.enAria`).
- Minstens 44 px raakvlak.

### Een referentie toevoegen of aanpassen

1. Enkel op Victors vraag, met de tekst zoals hij die geeft. Een citaat wordt
   nooit herschreven; inkorten mag, met hele zinnen.
2. In het juiste venster (`#ref-gekkoo`, `#ref-uantwerpen`, `#ref-promotor`,
   onderaan `index.html`) een `<li>` toevoegen naar het voorbeeld van de andere,
   met een `data-i18n`-sleutel per functie en per alinea van het citaat.
3. De Engelse tekst in `i18n.js` (vertaling van het citaat duidelijk als
   vertaling melden aan Victor).
4. Het getal in de knop "Referenties (5)" mee aanpassen.
5. Een nieuwe plek (een andere rol): een knop met `data-ref` en een nieuw
   venster met het palet van dat hoofdstuk.

### Trefwoorden toevoegen

- In een `.tags`-lijst als `<span>`, zonder hekje en zonder eigen animatie.

## 7. Controleren voor publicatie

1. Cache-versie ophogen (`?v=N` in `index.html`, ook in `404.html` voor `style.css`).
2. Beide talen, licht en donker, op 1280 en 375 px: geen overloop, geen consolefouten.
3. Gsm-profielen in Playwright (iPhone SE en iPhone 13), ook de compacte weergave.
   De cloud heeft enkel Chromium: vraag Victor bij opmaak voor de gsm om het op
   zijn iPhone na te kijken.
4. PDF's opnieuw gemaakt? Dan 2 bladen en blad 1 volledig.
5. Committen, de werkbranch pushen, `main` gelijkzetten. Meld de commit-hash en
   welke PDF's opnieuw gemaakt zijn.

## 8. Aanvullen

Kom je tot een nieuwe beslissing, of wordt een voorstel afgewezen, schrijf het
hier bij in het juiste hoofdstuk: wat, waarom, en wat niet werkte. Zo wordt het
later niet opnieuw voorgesteld.
