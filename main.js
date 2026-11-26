/* ============================================================
   Victor Van Sande - CV website  ·  interacties
   ------------------------------------------------------------
   Bewust weinig: de intro bij het eerste bezoek, de taalwissel, de
   instellingen, de lichtbak en het voorproefvenster. Alles staat open in
   de html, dus de pagina is ook zonder javascript volledig leesbaar.
   ============================================================ */
(() => {
  "use strict";

  /* ---- Mobiel menu ---- */
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  /* Eén plek die de drie dingen gelijk houdt: de klasse die het menu toont,
     het kruisje van de burger, en aria-expanded - dat laatste is het enige
     waaraan een schermlezer hoort of het menu openstaat. */
  const zetMenu = (open) => {
    if (!burger || !links) return;
    links.classList.toggle("open", open);
    burger.classList.toggle("on", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  };
  if (burger && links) {
    burger.addEventListener("click", () => zetMenu(!links.classList.contains("open")));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => zetMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") zetMenu(false); });
  }

  /* ---- Intro "Venster" ----
     De animatie zelf staat volledig in style.css; hier enkel de startpoort en
     het opruimen. Wie minder beweging wil, krijgt geen intro: dan gaat de
     klasse meteen weg en staat de hero er gewoon.
     De poort gaat pas open als het lettertype en de foto binnen zijn. De foto
     vult de letters; zonder foto zouden ze doorzichtig zijn, en een lettertype
     dat halverwege binnenkomt verandert de breedte van de naam. Er zit een dop
     op het wachten, zodat een trage verbinding de intro nooit tegenhoudt. */
  const wortel = document.documentElement;
  // in de compacte weergave staat de hero er niet, dus ook geen intro
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce" || wortel.dataset.view === "compact") {
    wortel.classList.remove("intro", "go");
  }
  if (wortel.classList.contains("intro")) {
    const foto = new Image();
    foto.src = "assets/photos/zonsverduistering.jpg";
    const klaar = Promise.race([
      Promise.all([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        foto.decode ? foto.decode().catch(() => {}) : Promise.resolve(),
      ]),
      new Promise((r) => setTimeout(r, 1400)),
    ]);
    const naam = document.querySelector(".hero-name");
    /* Beginstand per scherm: de naam zo groot mogelijk (hoogstens 2,4 keer),
       met marge links en rechts, en verticaal gecentreerd in de ruimte onder
       de menubalk. Gemeten zonder de animatie, anders meet je de vergroting. */
    const plaats = () => {
      if (!naam || wortel.classList.contains("go")) return;
      const anim = naam.style.animation;
      naam.style.animation = "none";
      const r = naam.querySelector(".grad-text").getBoundingClientRect();
      const n = naam.getBoundingClientRect();
      naam.style.animation = anim;
      const balk = (document.querySelector(".nav") || { offsetHeight: 0 }).offsetHeight;
      const marge = Math.max(16, innerWidth * 0.04);
      const sc = Math.max(1, Math.min(2.4, (innerWidth - 2 * marge) / r.width, (innerHeight - balk - 2 * marge) / r.height));
      const doelL = (innerWidth - r.width * sc) / 2;
      const doelT = balk + (innerHeight - balk - r.height * sc) / 2;
      wortel.style.setProperty("--vs", sc.toFixed(3));
      wortel.style.setProperty("--vtx", (doelL - n.left - (r.left - n.left) * sc).toFixed(1) + "px");
      wortel.style.setProperty("--vty", (doelT - n.top - (r.top - n.top) * sc).toFixed(1) + "px");
    };
    plaats();
    // eerst meten gebeurt soms nog met het vervanglettertype: opnieuw zodra
    // de webfonts er zijn, anders springt de naam na het vel naar een andere maat
    if (document.fonts) document.fonts.ready.then(plaats);
    addEventListener("resize", plaats);
    const done = () => wortel.classList.remove("intro", "go");
    /* Opruimen pas als alles gespeeld heeft: de naam is eerst klaar, de
       essentie en de pil eindigen samen het laatst. Wie de klasse te vroeg
       weghaalt, breekt die animaties af en ze springen naar hun eindstand. */
    const nogBezig = new Set(["v-name", "v-rest-essentie"]);
    document.addEventListener("animationend", (e) => {
      if (!wortel.classList.contains("go")) return;
      const k = e.animationName === "v-rest" ? (e.target.classList.contains("essentie") ? "v-rest-essentie" : "") : e.animationName;
      if (nogBezig.delete(k) && !nogBezig.size) done();
    });
    /* vangnet als animationend uitblijft; het telt pas wanneer de intro
       loopt en de pagina zichtbaar is, want in een achtergrondtab staat de
       animatie stil */
    const arm = () => setTimeout(done, 6000);
    const wapen = () => {
      if (document.visibilityState === "visible") arm();
      else document.addEventListener("visibilitychange", function onVis() {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", onVis);
        arm();
      });
    };
    /* De intro start pas als het vel papier weg is (vel.js) en het lettertype
       en de foto binnen zijn. Zonder vel is window.__velWeg al vervuld. */
    /* Ze start al als het vel voor de helft weg is (window.__velBijna), zodat
       vel en naam in elkaar overlopen. Op dat moment staat de hero nog licht
       vergroot onder het vel (vel-los); voor het meten van de naam en de pil
       gaat die vergroting even uit, anders kloppen de maten niet. */
    Promise.all([klaar, window.__velBijna || window.__velWeg || Promise.resolve()]).then(() => {
      const wrap = document.querySelector("#home > .wrap");
      if (wrap) wrap.style.transform = "none";
      plaats();
      if (window.__pilVoorIntro) window.__pilVoorIntro();
      if (document.querySelector(".hero-pil.pil-intro")) nogBezig.add("pil-open");
      if (wrap) wrap.style.transform = "";
      requestAnimationFrame(() => { wortel.classList.add("go"); wapen(); });
    });
  }

  /* ---- Sectietitels die in hun kolom passen ----
     De titel vult de linkerkolom, maar een langer woord (zoals "Experience" in
     het Engels) liep tot tegen de tekst ernaast. Elke titel krimpt daarom tot
     er minstens 36 px vrij blijft tot de rechterkolom. Herberekend na een
     taalwissel, bij een andere schermmaat en zodra de lettertypes er zijn. */
  const pasTitels = () => document.querySelectorAll(".sec-head .sec-title").forEach((t) => {
    t.style.fontSize = "";
    const kop = t.closest(".sec-head"), naast = kop && kop.lastElementChild;
    if (!naast || naast === t || getComputedStyle(kop).gridTemplateColumns.split(" ").length < 2) return;
    const r = document.createRange(); r.selectNodeContents(t);
    const breed = [...r.getClientRects()].reduce((m, q) => Math.max(m, q.right), 0) - t.getBoundingClientRect().left;
    const ruimte = naast.getBoundingClientRect().left - t.getBoundingClientRect().left - 36;
    if (breed > ruimte && breed > 0) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * ruimte / breed).toFixed(1) + "px";
  });
  /* ---- Titel en tekst ernaast op elkaar uitgelijnd ----
     De bovenkant van de hoofdletters in de ondertitel komt op dezelfde hoogte
     als de bovenkant van de sectietitel, en is de tekst korter dan de titel,
     dan valt de laatste regel op de onderlijn van de titel. Gemeten op de
     letters zelf: een onzichtbaar meetpunt geeft de onderlijn (baseline) van
     een regel, het canvas de hoogte van een hoofdletter. Enkel als titel en
     tekst naast elkaar staan; anders blijft de gewone opmaak. */
  const meetLijn = (el, aanBegin) => {
    const p = document.createElement("span");
    p.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    if (aanBegin) el.insertBefore(p, el.firstChild); else el.appendChild(p);
    const y = p.getBoundingClientRect().bottom;
    p.remove();
    return y;
  };
  const kapHoogte = (el) => {
    const cs = getComputedStyle(el);
    const c = kapHoogte.c || (kapHoogte.c = document.createElement("canvas").getContext("2d"));
    c.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    return c.measureText("H").actualBoundingBoxAscent;
  };
  const lijnKoppen = () => document.querySelectorAll(".sec-head").forEach((kop) => {
    const titel = kop.querySelector(".sec-title"), naast = kop.lastElementChild;
    if (!titel || !naast || naast === titel) return;
    // de ondertitel, of bij gebrek daaraan het eerste tekstelement (bij KSA een label)
    const sub = naast.querySelector(".sec-sub") || naast.firstElementChild, laatste = naast.lastElementChild;
    naast.style.paddingTop = ""; naast.style.marginTop = "";
    if (laatste && laatste !== sub) laatste.style.marginTop = "";
    if (!sub || getComputedStyle(kop).gridTemplateColumns.split(" ").length < 2) return;
    naast.style.paddingTop = "0px";
    const titelTop = meetLijn(titel, true) - kapHoogte(titel);
    const subTop = meetLijn(sub, true) - kapHoogte(sub);
    naast.style.marginTop = (titelTop - subTop).toFixed(1) + "px";
    if (laatste && laatste !== sub) {
      // te kort: de tekst zakt tot op de onderlijn van de titel; een paar
      // pixels te lang: de ruimte boven de tekst krimpt (tot minstens 4 px)
      const tekort = meetLijn(titel, false) - meetLijn(laatste, false);
      const marge = parseFloat(getComputedStyle(laatste).marginTop);
      if (tekort > 1) laatste.style.marginTop = (marge + tekort).toFixed(1) + "px";
      else if (tekort < -1 && marge + tekort >= 4) laatste.style.marginTop = (marge + tekort).toFixed(1) + "px";
    }
  });
  /* ---- Hero: de tekst ernaast bovenaan uitgelijnd op de naam ----
     Zoals bij de sectietitels: de bovenkant van de hoofdletters van de eerste
     regel ("Communicatiewetenschapper.") op die van "VICTOR". Gemeten met
     offsetTop, dat transformaties negeert: tijdens de intro staat de naam
     vergroot en schuift de tekst nog, en zo verspringt er achteraf niets.
     Enkel als de tekst naast de naam staat (niet op gsm of in halve vensters). */
  const absY = (el) => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; };
  const basislijn = (el) => {
    const p = document.createElement("span");
    p.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    el.insertBefore(p, el.firstChild);
    const y = absY(p); p.remove();
    return y;
  };
  const heroLijn = () => {
    const naam = document.querySelector(".hero-name"), zij = document.querySelector(".hero-side");
    const lead = zij && zij.querySelector(".hero-lead");
    if (!naam || !lead) return;
    zij.style.alignSelf = ""; zij.style.marginTop = ""; naam.style.alignSelf = "";
    if (zij.offsetLeft < naam.offsetLeft + naam.offsetWidth * 0.5) return; // onder elkaar
    // beide bovenaan in hun rij: met de naam onderaan (align-items: end) groeide
    // de rij mee met de marge en zakte de naam evenveel
    zij.style.alignSelf = "start"; naam.style.alignSelf = "start";
    const verschil = (basislijn(naam) - kapHoogte(naam)) - (basislijn(lead) - kapHoogte(lead));
    zij.style.marginTop = verschil.toFixed(1) + "px";
  };
  /* Enkel meten wat zichtbaar is: in de compacte weergave staan de secties
     op display: none, en een meting gaf dan 0. Wie daarna terugkeerde naar de
     gewone weergave, kreeg overal een marge van -64 px (de tekst stond hoog
     boven de titel). Daarom niets doen zolang de secties verborgen zijn, en
     opnieuw meten zodra de weergave wisselt. */
  const koppen = () => {
    if (wortel.dataset.view === "compact") return;
    pasTitels(); lijnKoppen(); heroLijn();
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(koppen);
  addEventListener("resize", koppen);
  addEventListener("cv-layout", koppen);
  new MutationObserver(() => requestAnimationFrame(koppen)).observe(wortel, { attributes: true, attributeFilter: ["data-view"] });

  /* ---- Portret in een pil naast de naam ----
     Rechts van "Victor" staat een pil met het portret, even hoog als de
     hoofdletters en precies zo breed dat ze eindigt waar "Sande" eindigt.
     De maten komen uit de tekst zelf: een Range geeft per regel de rechterrand,
     en het canvas meet hoe hoog een hoofdletter is binnen de regel. Past de pil
     niet (de naam breekt anders, of er is te weinig plaats), dan blijft ze weg.
     Tijdens de intro staat de naam elders; de pil komt pas daarna. */
  (() => {
    const h1 = document.querySelector(".hero-name");
    const hero = document.querySelector(".hero");
    if (!h1 || !hero) return;
    const pil = document.createElement("span");
    pil.className = "hero-pil";
    pil.setAttribute("aria-hidden", "true");
    pil.innerHTML = '<img src="assets/victor-profiel.jpg" alt="" width="400" height="400" decoding="async" />';
    /* De pil staat in de naam zelf, niet ernaast in de hero: zo beweegt ze
       tijdens de intro mee met de naam (die krimpt via een transform). Eerst
       stond ze al op haar eindplaats terwijl de naam nog groter was, en schoof
       "Victor" bij het openen van de pil nog een eind onder haar door (op de pc
       zo'n 130 px). Het opsplitsen van de letters raakt enkel .grad-text aan. */
    h1.appendChild(pil);
    const img = pil.firstChild;
    /* Op een iPhone (in de browser van Messenger) bleef de foto eens weg: dan
       stond er een leeg kader met het vraagteken van een kapotte afbeelding.
       Bij een fout één nieuwe poging; lukt ook die niet, dan verdwijnt de pil
       helemaal (de klasse weg) in plaats van een leeg kader te tonen. */
    let pogingen = 0;
    img.addEventListener("error", () => {
      if (pogingen++ === 0) { setTimeout(() => { img.src = "assets/victor-profiel.jpg?p=2"; }, 400); return; }
      pil.classList.add("weg");
    });
    const KOPX = 0.41, KOP = 0.33;          // plaats van het hoofd in de foto (0 tot 1)
    const ZOOM = 1;                         // zo ver mogelijk uitgezoomd: de foto vult net de breedte van de pil
    const meet = document.createElement("canvas").getContext("2d");
    const zet = (voorIntro) => {
      if (wortel.dataset.view === "compact") { pil.classList.remove("toon"); return; }
      // tijdens de intro staat de naam elders: niets doen, behalve vlak voor de
      // start, wanneer de naam nog stilstaat en gemeten kan worden zonder animatie
      if (wortel.classList.contains("intro") && voorIntro !== true) return;
      const anim = voorIntro === true ? h1.style.animation : null;
      if (voorIntro === true) h1.style.animation = "none";
      const cs = getComputedStyle(h1);
      meet.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
      const m = meet.measureText("VICTOR");
      const kap = m.actualBoundingBoxAscent, asc = m.fontBoundingBoxAscent;
      // enkel de tekst van de naam zelf meten, niet het kader of de label van Tech Text
      const regels = [], rects = [];
      const tw = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.textContent.trim() || n.parentElement.closest(".tch-kader, .tch-specks")) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        rects.push(...r.getClientRects());
      }
      rects.forEach((q) => {
        if (q.width < 2) return;
        const rg = regels.find((x) => Math.abs(x.top - q.top) < q.height / 2);
        if (rg) { rg.right = Math.max(rg.right, q.right); rg.left = Math.min(rg.left, q.left); }
        else regels.push({ top: q.top, left: q.left, right: q.right });
      });
      regels.sort((a, b) => a.top - b.top);
      if (regels.length < 2 || !kap || !asc) { if (voorIntro === true) h1.style.animation = anim; pil.classList.remove("toon"); return; }
      const fs = parseFloat(cs.fontSize);
      const hr = h1.getBoundingClientRect();
      const links = regels[0].right + fs * 0.14, rechts = Math.max(regels[1].right, regels[0].right);
      const breed = rechts - links, hoog = kap;
      if (breed < hoog * 1.3) { if (voorIntro === true) h1.style.animation = anim; pil.classList.remove("toon"); return; }
      pil.style.left = (links - hr.left).toFixed(1) + "px";
      pil.style.top = (regels[0].top + asc - kap - hr.top).toFixed(1) + "px";
      pil.style.width = breed.toFixed(1) + "px";
      pil.style.height = hoog.toFixed(1) + "px";
      // de hoeken groeien mee met de hoogte, zodat ze op elk scherm even zacht ogen
      pil.style.setProperty("--pr", (hoog * 0.14).toFixed(1) + "px");
      // het hoofd zo centraal als de foto toelaat, zonder dat er rand zichtbaar wordt
      const z = Math.max(breed, hoog) * ZOOM;
      const kl = (v, min) => Math.min(0, Math.max(min, v));
      img.style.width = img.style.height = z.toFixed(1) + "px";
      img.style.left = kl(breed / 2 - KOPX * z, breed - z).toFixed(1) + "px";
      img.style.top = kl(hoog / 2 - KOP * z, hoog - z).toFixed(1) + "px";
      if (voorIntro === true) { h1.style.animation = anim; pil.classList.add("pil-intro"); }
      pil.classList.add("toon");
    };
    window.__pilVoorIntro = () => zet(true);
    const plan = () => requestAnimationFrame(zet);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(plan);
    addEventListener("resize", plan);
    addEventListener("cv-layout", plan);
    // enkel op klasse en weergave reageren: het vel zet elk beeld --vp in de
    // style van <html>, en een meting per beeld deed het wegvegen haperen
    new MutationObserver(plan).observe(wortel, { attributes: true, attributeFilter: ["class", "data-view"] });
  })();

  /* ---- De naam na de intro: Tech Text bij hover ----
     Zodra alle animaties gespeeld hebben (de klasse intro is weg), wordt de
     naam bij hover een
     "Tech Text", eigen bouw naar die van React Bits: de letter onder de cursor
     wordt een lijnletter, een dun kader glijdt van letter naar letter met de
     letter en zijn grootte als label, er knipperen kleine vierkantjes rond, en
     een klik laat de letter opspringen met een golf door de buren.
     Css kan de lijn van een tekstletter niet stippelen; de lijnletter krijgt
     daarom een doorlopende lijn, een van de stijlen die de component zelf ook
     kent. Zolang de naam in deze modus staat, verliest hij tijdelijk zijn
     background-clip (anders kan één letter niet hol worden). */
  const naamTekst = document.querySelector(".hero-name .grad-text");
  const naamH1 = document.querySelector(".hero-name");
  const geenBeweging = () => matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
  if (naamTekst && naamH1) {
    let klaar = false;
    /* De letters opsplitsen zodra de intro gedaan is. Er schoof hier eerst
       nog een witte lichtglans over de naam; die is op Victors vraag weg.
       Op iPhone en iPad (WebKit) tekent background-clip: text niet door in
       losse inline-block letters: de naam werd daar onzichtbaar. Na het
       opsplitsen is de naam daarom gewone tekst in de inktkleur (.gesplitst). */
    const zetKlaar = () => {
      if (klaar || wortel.classList.contains("intro")) return;
      klaar = true;
      splits();
    };
    const splits = () => {
      // letters opsplitsen; woorden blijven bij elkaar, zodat de regels breken zoals voorheen
      const tekst = naamTekst.textContent;
      naamTekst.setAttribute("aria-label", tekst);
      naamTekst.textContent = "";
      const letters = [];
      tekst.split(/(\s+)/).forEach((stuk) => {
        if (!stuk) return;
        if (/^\s+$/.test(stuk)) { naamTekst.appendChild(document.createTextNode(stuk)); return; }
        const woord = document.createElement("span");
        woord.className = "tch-w"; woord.setAttribute("aria-hidden", "true");
        [...stuk].forEach((c) => {
          const l = document.createElement("span");
          l.className = "tch"; l.textContent = c;
          woord.appendChild(l); letters.push(l);
        });
        naamTekst.appendChild(woord);
      });
      // het kader met label en de vierkantjes leven in de kop zelf
      const kader = document.createElement("span");
      kader.className = "tch-kader"; kader.setAttribute("aria-hidden", "true");
      kader.innerHTML = '<i class="tch-h tl"></i><i class="tch-h tr"></i><i class="tch-h bl"></i><i class="tch-h br"></i><b class="tch-label"></b>';
      const label = kader.querySelector(".tch-label");
      const specks = document.createElement("span");
      specks.className = "tch-specks"; specks.setAttribute("aria-hidden", "true");
      naamH1.append(kader, specks);
      naamTekst.classList.add("gesplitst");

      let actief = null;
      const zaai = (l) => {
        specks.textContent = "";
        if (geenBeweging()) return;
        const r = l.getBoundingClientRect(), h = naamH1.getBoundingClientRect();
        for (let i = 0; i < 12; i++) {
          const sp = document.createElement("i");
          const x = r.left - h.left + (Math.random() * 1.6 - .3) * r.width;
          const y = r.top - h.top + (Math.random() * 1.4 - .2) * r.height;
          sp.style.left = x.toFixed(0) + "px"; sp.style.top = y.toFixed(0) + "px";
          sp.style.animationDelay = (Math.random() * 1.2).toFixed(2) + "s";
          specks.appendChild(sp);
        }
      };
      const kies = (l) => {
        if (l === actief) return;
        if (actief) actief.classList.remove("lijn");
        actief = l;
        if (!l) { naamH1.classList.remove("tech"); return; }
        naamH1.classList.add("tech");
        l.classList.add("lijn");
        const r = l.getBoundingClientRect(), h = naamH1.getBoundingClientRect();
        kader.style.transform = "translate(" + (r.left - h.left).toFixed(1) + "px," + (r.top - h.top).toFixed(1) + "px)";
        kader.style.width = r.width.toFixed(1) + "px";
        kader.style.height = r.height.toFixed(1) + "px";
        label.textContent = l.textContent + " · " + Math.round(parseFloat(getComputedStyle(l).fontSize)) + "px";
        zaai(l);
      };
      naamH1.addEventListener("pointermove", (e) => {
        const l = e.target.closest && e.target.closest(".tch");
        if (l) kies(l);
      });
      naamH1.addEventListener("pointerleave", () => kies(null));
      // klik: de letter springt op en een golf loopt door de buren, die tijdens
      // het bewegen ook even hun lijn tonen
      naamH1.addEventListener("click", (e) => {
        const l = e.target.closest && e.target.closest(".tch");
        if (!l || geenBeweging()) return;
        kies(l);
        const i = letters.indexOf(l);
        letters.forEach((x, k) => {
          const d = Math.abs(k - i);
          if (d > 4) return;
          x.style.setProperty("--kick", (1 - d * 0.22).toFixed(2));
          x.style.animationDelay = (d * 55) + "ms";
          x.classList.remove("kick"); void x.offsetWidth; x.classList.add("kick");
        });
      });
      letters.forEach((x) => x.addEventListener("animationend", (e) => { if (e.animationName === "tch-kick") x.classList.remove("kick"); }));
    };
    zetKlaar();
    new MutationObserver(zetKlaar).observe(wortel, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---- Grainient op elke knop ----
     Het korrelige verloop volgt de cursor een beetje: de lichtste vlek staat
     waar de muis is. De rest (de kleuren, de korrel, het drijven) zit in css.
     Eén luisteraar voor de hele pagina, zodat ook knoppen die stapel.js of
     bonnetje.js later maakt meedoen. */
  document.addEventListener("pointermove", (e) => {
    const b = e.target.closest && e.target.closest(".btn, .doc-btn, .gal-btn, .stack-hoek a, .ref-citeer");
    if (!b) return;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  }, { passive: true });

  /* ---- Foto's op een touchscherm: kleur in het midden ----
     Zonder muis is er geen hover, en bleven de grote foto's gedempt. Hier
     krijgt elke foto haar volle kleur zodra haar midden dicht bij het midden
     van het scherm staat (binnen 12 % van de schermhoogte), en dempt ze
     geleidelijk weer tot 45 % ervandaan (smoothstep, zodat er geen knik in
     zit). Enkel de foto's die in beeld zijn worden herrekend, één keer per
     beeld. De css zet --f om in de gradering. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches && "IntersectionObserver" in window) {
    const inBeeld = new Set();
    let fRaf = null;
    /* Eerst alle foto's meten, dan pas schrijven, en enkel een waarde die
       verandert: meten en schrijven door elkaar dwong de browser per foto de
       opmaak opnieuw te berekenen. In de compacte weergave zijn deze foto's
       verborgen, dan doet dit niets. */
    const vorigF = new WeakMap();
    const focus = () => {
      fRaf = null;
      if (wortel.dataset.view === "compact") return;
      const h = innerHeight, mid = h / 2;
      const metingen = [...inBeeld].map((img) => [img, img.getBoundingClientRect()]);
      metingen.forEach(([img, r]) => {
        const d = Math.abs(r.top + r.height / 2 - mid) / h;
        const t = Math.min(1, Math.max(0, (0.45 - d) / (0.45 - 0.12)));
        const f = (t * t * (3 - 2 * t)).toFixed(3);
        if (vorigF.get(img) !== f) { vorigF.set(img, f); img.style.setProperty("--f", f); }
      });
    };
    const planFocus = () => { if (fRaf === null && wortel.dataset.view !== "compact") fRaf = requestAnimationFrame(focus); };
    const io = new IntersectionObserver((items) => {
      items.forEach((it) => {
        if (it.isIntersecting) inBeeld.add(it.target);
        else { inBeeld.delete(it.target); it.target.style.setProperty("--f", "0"); }
      });
      planFocus();
    });
    document.querySelectorAll(".frame img").forEach((img) => io.observe(img));
    addEventListener("scroll", planFocus, { passive: true });
    addEventListener("resize", planFocus);
  }

  /* ---- Referenties ----
     Een knop met data-ref opent het venster met die id (een <dialog>, dus
     focus, Escape en schermlezers zitten ingebouwd). Eén luisteraar voor de
     hele pagina, zodat ook de kopie van een knop op de achterkant van een
     compacte kaart werkt. Een klik op de waas sluit; "Toon citaat" klapt het
     citaat open en dicht. */
  document.addEventListener("click", (e) => {
    const knop = e.target.closest && e.target.closest("[data-ref]");
    if (!knop) return;
    const d = document.getElementById(knop.dataset.ref);
    if (d && typeof d.showModal === "function" && !d.open) d.showModal();
  });
  document.querySelectorAll(".refbox").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    const sluit = d.querySelector(".refbox-sluit");
    if (sluit) sluit.addEventListener("click", () => d.close());
    d.querySelectorAll(".ref-citeer").forEach((b) => b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      const q = document.getElementById(b.getAttribute("aria-controls"));
      if (q) q.hidden = !open;
    }));
  });

  /* ---- Mailkeuze ----
     Een mailto-link opent het standaardmailprogramma, en op veel computers is
     dat er niet (Windows opent dan Edge of een lege app). Daarom opent elke
     mailto-link op de site een klein menu: Gmail, Outlook (beide in een nieuw
     tabblad), het eigen mailprogramma of het adres kopiëren. Zonder script
     blijft het een gewone mailto-link. Het menu neemt de kleuren over van de
     plek waar je klikte, en staat in een geopend venster (referenties) in dat
     venster, anders viel het eronder. Na slepen aan het lint opent er niets
     (lint.js zet dan preventDefault). */
  (() => {
    const T = {
      nl: { app: "Eigen mailprogramma", kopieer: "Kopieer adres", gekopieerd: "Gekopieerd", tab: "nieuw tabblad" },
      en: { app: "Default mail app", kopieer: "Copy address", gekopieerd: "Copied", tab: "new tab" }
    };
    let menu = null, bron = null;
    const sluit = (terug) => {
      if (!menu) return;
      menu.remove(); menu = null;
      if (terug && bron) bron.focus({ preventScroll: true });
      bron = null;
    };
    const open = (a, x) => {
      sluit(false);
      const adres = decodeURIComponent(a.getAttribute("href").replace(/^mailto:/i, "").split("?")[0]);
      const t = T[document.documentElement.lang === "en" ? "en" : "nl"];
      const enc = encodeURIComponent(adres);
      menu = document.createElement("div");
      menu.className = "mailkeuze";
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", adres);
      menu.innerHTML =
        '<span class="mailkeuze-adres" translate="no"></span>' +
        '<a role="menuitem" target="_blank" rel="noopener" href="https://mail.google.com/mail/?view=cm&fs=1&to=' + enc + '"><span>Gmail</span><small></small></a>' +
        '<a role="menuitem" target="_blank" rel="noopener" href="https://outlook.office.com/mail/deeplink/compose?to=' + enc + '"><span>Outlook</span><small></small></a>' +
        '<a role="menuitem" href="mailto:' + adres + '"><span></span></a>' +
        '<button type="button" role="menuitem" class="mailkeuze-kopie"><span></span></button>';
      menu.querySelector(".mailkeuze-adres").textContent = adres;
      menu.querySelectorAll("small").forEach((s) => (s.textContent = t.tab + " \u2197"));
      menu.querySelector('a[href^="mailto:"] span').textContent = t.app;
      const kopie = menu.querySelector(".mailkeuze-kopie");
      kopie.firstChild.textContent = t.kopieer;
      // kleuren van de plek waar je klikte (de menu staat los in de body)
      const cs = getComputedStyle(a);
      ["--g-bg", "--g-ink", "--g-soft", "--g-dim", "--g-line", "--g-acc"].forEach((v) => menu.style.setProperty(v, cs.getPropertyValue(v)));
      (a.closest("dialog[open]") || document.body).appendChild(menu);
      // plaats: onder de link, of erboven als er onder geen ruimte is
      const r = a.getBoundingClientRect(), m = menu.getBoundingClientRect(), rand = 12;
      let left = r.width > 420 && x != null ? x - m.width / 2 : r.left;
      left = Math.max(rand, Math.min(left, innerWidth - m.width - rand));
      let top = r.bottom + 8;
      if (top + m.height > innerHeight - rand) top = Math.max(rand, r.top - m.height - 8);
      menu.style.left = left + "px"; menu.style.top = top + "px";
      bron = a;
      const items = [...menu.querySelectorAll('[role="menuitem"]')];
      items[0].focus({ preventScroll: true });
      menu.addEventListener("keydown", (e) => {
        const i = items.indexOf(document.activeElement);
        if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
        else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); sluit(true); }
        else if (e.key === "Tab") sluit(false);
      });
      menu.addEventListener("click", (e) => {
        if (e.target.closest(".mailkeuze-kopie")) {
          const klaar = () => {
            kopie.firstChild.textContent = t.gekopieerd; kopie.classList.add("ok");
            setTimeout(() => sluit(true), 1100);
          };
          const selecteer = () => { // terugval: het adres selecteren, zodat Ctrl+C werkt
            const sel = getSelection(), rg = document.createRange();
            rg.selectNodeContents(menu.querySelector(".mailkeuze-adres")); sel.removeAllRanges(); sel.addRange(rg);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(adres).then(klaar, selecteer);
          else selecteer();
          return;
        }
        if (e.target.closest("a")) setTimeout(() => sluit(false), 0);
      });
    };
    document.addEventListener("click", (e) => {
      if (menu && !menu.contains(e.target) && !(bron && bron.contains(e.target))) sluit(false);
      const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
      if (!a || a.closest(".mailkeuze") || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (menu && bron === a) { sluit(true); return; }
      open(a, e.detail ? e.clientX : null);
    });
    addEventListener("resize", () => sluit(false));
    addEventListener("scroll", () => sluit(false), { passive: true });
    document.addEventListener("close", () => sluit(false), true); // een venster dat sluit, neemt het menu mee
  })();

  /* ---- Zachte overgang tussen secties ----
     Elke sectie krijgt de achtergrondkleur van de sectie erboven mee, zodat
     de css bovenaan een verloop kan tekenen. Opnieuw na een wissel tussen
     licht en donker, want dan veranderen alle kleuren. */
  const vloei = () => {
    const blokken = [...document.querySelectorAll("main > .grade, main > .sec > .grade, footer.grade")];
    let vorige = null;
    blokken.forEach((b) => {
      const eigen = getComputedStyle(b).backgroundColor;
      if (vorige && vorige !== eigen) { b.style.setProperty("--vorige", vorige); b.classList.add("vloeit"); }
      else b.classList.remove("vloeit");
      vorige = eigen;
    });
  };
  vloei();
  new MutationObserver(vloei).observe(wortel, { attributes: true, attributeFilter: ["data-mode", "data-view"] });

  /* ---- Cijfers als een oud vertrekbord op de luchthaven ----
     Het eindgetal staat al in de html, zodat een schermlezer of een bezoeker
     zonder javascript het altijd leest. Hier wordt elk getal opgesplitst in
     een verborgen tekst voor schermlezers (.tel-sr), een onzichtbare kopie die
     de breedte vasthoudt (.tel-maat, zodat er niets verspringt), en de
     zichtbare kopie (.tel-live, aria-hidden). Komt het getal in beeld, dan
     klapt elk cijfer een tijdje willekeurig door alle cijfers, en landt het
     daarna op het juiste, van links naar rechts, zoals de klapborden van
     vroeger. Leestekens (het streepje, de punt) blijven staan. Eén keer per
     bezoek, niet bij minder beweging. Het scheidingsteken volgt de taal:
     14.716 in het Nederlands, 14,716 in het Engels. */
  const telTaal = () => (document.documentElement.lang === "en" ? "en" : "nl");
  const telTekst = (el) => el.dataset.count !== undefined
    ? parseFloat(el.dataset.count).toLocaleString(telTaal()) + (el.dataset.suffix || "")
    : (el.dataset.vast || (el.dataset.vast = el.textContent.trim()));
  const telBouw = (el) => {
    if (el.querySelector(".tel-sr")) return;
    const t = telTekst(el);
    el.innerHTML = '<span class="tel-sr"></span><span class="tel-num" aria-hidden="true"><span class="tel-maat"></span><span class="tel-live"></span></span>';
    el.querySelector(".tel-sr").textContent = t;
    el.querySelector(".tel-maat").textContent = t;
  };
  // de zichtbare tekens: per cijfer een vakje dat kan omklappen
  const telVakjes = (el, tekst) => {
    const live = el.querySelector(".tel-live");
    live.textContent = "";
    return [...tekst].map((c) => {
      const sp = document.createElement("span");
      sp.textContent = c;
      // enkel het scheidingsteken van duizendtallen staat gedempt, het streepje van 18–65 niet
      sp.className = /\d/.test(c) ? "tel-d" : (/[.,]/.test(c) ? "tel-sep" : "tel-teken");
      live.appendChild(sp);
      return sp;
    });
  };
  /* Elk omklappen speelt een korte animatie. Eerst gebeurde dat door de klasse
     weg te halen, de opmaak te laten herberekenen (offsetWidth) en de klasse
     terug te zetten: per cijfer, elke 70 ms, en dat kostte op een trage gsm
     merkbaar rekentijd. Een Web Animation herstart zonder herberekening en
     ziet er hetzelfde uit (de keyframes van tel-klap in style.css). */
  const KLAP = [{ transform: "scaleY(.35)", opacity: .55 }, { transform: "none", opacity: 1 }];
  const klap = (sp, c) => {
    sp.textContent = c;
    if (sp.animate) sp.animate(KLAP, { duration: 70, easing: "linear" });
    else { sp.classList.remove("klap"); void sp.offsetWidth; sp.classList.add("klap"); }
  };
  const hertelGetallen = () => document.querySelectorAll("[data-count], [data-flap]").forEach((el) => {
    const t = telTekst(el);
    if (!el.querySelector(".tel-sr")) { el.textContent = t; return; }
    el.querySelector(".tel-sr").textContent = t;
    el.querySelector(".tel-maat").textContent = t;
    if (!el.classList.contains("telt")) telVakjes(el, t).forEach((sp) => { if (el.classList.contains("wacht") && sp.className === "tel-d") sp.textContent = String(Math.floor(Math.random() * 10)); });
  });
  (() => {
    const tellers = [...document.querySelectorAll("[data-count], [data-flap]")];
    const stil = matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
    if (stil || !("IntersectionObserver" in window)) return;
    tellers.forEach(telBouw);
    const willekeurig = () => String(Math.floor(Math.random() * 10));
    const start = (el) => {
      el.classList.remove("wacht"); el.classList.add("telt");
      const doel = telTekst(el), vakjes = telVakjes(el, doel);
      let k = 0;
      const lopend = [];
      vakjes.forEach((sp, i) => {
        if (sp.className !== "tel-d") return;
        // elk cijfer landt iets later dan zijn linkerbuur, met wat speling
        const land = 700 + k * 230 + Math.random() * 160;
        k++;
        sp.textContent = willekeurig();
        let t = 0;
        const tik = () => {
          t += 70;
          if (t >= land) { klap(sp, doel[i]); return; }
          let c = willekeurig(); if (c === sp.textContent) c = String((+c + 1) % 10);
          klap(sp, c);
          lopend.push(setTimeout(tik, 70));
        };
        lopend.push(setTimeout(tik, 70));
      });
      setTimeout(() => el.classList.remove("telt"), 700 + k * 230 + 300);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      start(e.target);
    }), { threshold: 0.4 });
    // tot ze in beeld komen, staan er willekeurige cijfers; wie dat nooit ziet, leest het eindgetal via .tel-sr
    tellers.forEach((el) => {
      el.classList.add("wacht");
      telVakjes(el, telTekst(el)).forEach((sp) => { if (sp.className === "tel-d") sp.textContent = willekeurig(); });
      io.observe(el);
    });
  })();

  /* ---- Language switch (NL / EN) ---- */
  const I18N = (window.I18N && window.I18N.en) || {};
  // de taalkeuze staat in de instellingen: twee knoppen, Nederlands en English
  const taalKnoppen = document.querySelectorAll(".taal-keuze [data-lang]");
  /* De kop van het document volgt de taal mee. Dat gebeurde niet: schakelde je
     naar het Engels, dan bleef de tabtitel en de omschrijving Nederlands - en
     dat is precies wat een gedeelde link laat zien. De Nederlandse waarden
     worden één keer bewaard, zodat terugschakelen ze exact herstelt. */
  const metaOmschrijving = document.querySelector('meta[name="description"]');
  const metaLocale = document.querySelector('meta[property="og:locale"]');
  const nlKop = {
    titel: document.title,
    omschrijving: metaOmschrijving ? metaOmschrijving.content : "",
    locale: metaLocale ? metaLocale.content : "",
  };
  const zetKop = (en) => {
    document.title = (en && I18N.doc_title) ? I18N.doc_title : nlKop.titel;
    if (metaOmschrijving) metaOmschrijving.content = (en && I18N.doc_desc) ? I18N.doc_desc : nlKop.omschrijving;
    if (metaLocale) metaLocale.content = en ? "en_GB" : nlKop.locale;
  };
  const i18nEls = [...document.querySelectorAll("[data-i18n]")];
  i18nEls.forEach((el) => { el.dataset.nlHtml = el.innerHTML; });
  /* Beschrijvingen voor schermlezers volgen de taal: de alt van elke foto
     (per bestand, uit I18N.enAlt), de data-alt van de diplomaknoppen, en de
     aria-labels van knoppen zonder zichtbare tekst (uit I18N.enAria). Het
     Nederlands wordt één keer bewaard, zodat terugschakelen het exact herstelt.
     Ook knoppen die later gebouwd worden (galerijen) krijgen dit mee, want
     dit loopt bij elke wissel opnieuw over de hele pagina. */
  const vertaalLabels = (en) => {
    const altEn = (window.I18N && window.I18N.enAlt) || {}, ariaEn = (window.I18N && window.I18N.enAria) || {};
    const bestand = (pad) => (pad || "").split("/").pop();
    document.querySelectorAll("img[alt]").forEach((im) => {
      if (im.dataset.nlAlt === undefined) im.dataset.nlAlt = im.getAttribute("alt");
      const e = altEn[bestand(im.getAttribute("src"))];
      if (im.dataset.nlAlt && e) im.setAttribute("alt", en ? e : im.dataset.nlAlt);
    });
    document.querySelectorAll("[data-alt]").forEach((b) => {
      if (b.dataset.nlDataAlt === undefined) b.dataset.nlDataAlt = b.dataset.alt;
      const e = altEn[bestand(b.dataset.full)];
      if (e) b.dataset.alt = en ? e : b.dataset.nlDataAlt;
    });
    document.querySelectorAll("[aria-label]").forEach((el) => {
      if (el.classList.contains("mode-toggle")) return;  // die zetten hun eigen label
      if (el.dataset.nlAria === undefined) {
        // een knop die in het Engels gebouwd werd (galerij bij een Engelse start): terug naar zijn Nederlandse sleutel
        let nl = el.getAttribute("aria-label");
        const terug = Object.keys(ariaEn).find((k) => ariaEn[k] === nl);
        if (terug) nl = terug;
        const foto = /^Photo (\d+)$/.exec(nl);
        if (foto) nl = "Foto " + foto[1];
        el.dataset.nlAria = nl;
      }
      const nl = el.dataset.nlAria, foto = /^Foto (\d+)$/.exec(nl);
      const e = ariaEn[nl] || (foto ? "Photo " + foto[1] : null);
      if (e) el.setAttribute("aria-label", en ? e : nl);
    });
    document.querySelectorAll('[aria-roledescription="carrousel"], [aria-roledescription="carousel"]').forEach((el) =>
      el.setAttribute("aria-roledescription", en ? "carousel" : "carrousel"));
  };
  // de galerijen bouwen hun knoppen pas na deze code: één keer opnieuw zodra alles staat
  addEventListener("load", () => vertaalLabels(document.documentElement.lang === "en"));

  const applyLang = (lang) => {
    const en = lang === "en";
    document.documentElement.lang = en ? "en" : "nl";
    zetKop(en);
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = (en && I18N[key] != null) ? I18N[key] : el.dataset.nlHtml;
    });
    try { localStorage.setItem("cv-lang", lang); } catch (e) {}
    taalKnoppen.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.lang === "en") === en)));
    hertelGetallen();
    vertaalLabels(en);
    // wie de site in het Engels leest, downloadt ook het Engelse cv
    document.querySelectorAll('a[href$="cv-victor-van-sande.pdf"], a[href$="cv-victor-van-sande-en.pdf"]').forEach((a) => {
      a.setAttribute("href", en ? "assets/cv-victor-van-sande-en.pdf" : "assets/cv-victor-van-sande.pdf");
    });
    // het voorproefvenster vertaalt zijn eigen ingevulde zinnen mee
    window.dispatchEvent(new Event("cv-layout"));
  };
  taalKnoppen.forEach((b) => b.addEventListener("click", () => {
    if ((b.dataset.lang === "en") !== (document.documentElement.lang === "en")) applyLang(b.dataset.lang);
  }));
  const savedLang = (() => { try { return localStorage.getItem("cv-lang"); } catch (e) { return null; } })();
  applyLang(savedLang === "en" ? "en" : "nl");

  /* ---- Settings menu (mode · language · theme · accessibility in one popover) ---- */
  const setBtn = document.querySelector(".settings-toggle");
  const setPop = document.querySelector(".settings-pop");
  if (setBtn && setPop) {
    const closePop = () => { setPop.classList.remove("open"); setBtn.setAttribute("aria-expanded", "false"); };
    setBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = setPop.classList.toggle("open");
      setBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    setPop.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", closePop);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); });
  }

  /* ---- Tekstgrootte ----
     Zet de basislettergrootte op <html>. De site meet in rem, dus tekst én
     witruimte schalen samen mee; de koppen staan in clamp() met vw en groeien
     daardoor beheerst mee in plaats van door te schieten. De keuze wordt
     bewaard en al in de <head> toegepast, zodat de pagina niet zichtbaar
     verspringt bij het laden. */
  const zoomOut = document.querySelector(".zoom-out");
  const zoomIn = document.querySelector(".zoom-in");
  const zoomVal = document.querySelector(".zoom-val");
  if (zoomOut && zoomIn && zoomVal) {
    const STAPPEN = [80, 90, 100, 110, 120, 130];
    let huidig = 100;
    try {
      const opgeslagen = parseInt(localStorage.getItem("cv-zoom"), 10);
      if (STAPPEN.includes(opgeslagen)) huidig = opgeslagen;
    } catch (e) {}
    const pas = (z, bewaar) => {
      huidig = z;
      // 100% blijft de standaard van de browser, dus dan zetten we niets vast
      if (z === 100) document.documentElement.style.removeProperty("font-size");
      else document.documentElement.style.fontSize = z + "%";
      zoomVal.textContent = z + "%";
      zoomOut.disabled = z === STAPPEN[0];
      zoomIn.disabled = z === STAPPEN[STAPPEN.length - 1];
      if (bewaar) { try { localStorage.setItem("cv-zoom", String(z)); } catch (e) {} }
      // alles in de balk schaalt mee, dus die moet opnieuw nameten of hij past
      window.dispatchEvent(new Event("cv-layout"));
    };
    const stap = (richting) => {
      const i = STAPPEN.indexOf(huidig);
      const volgende = STAPPEN[i + richting];
      if (volgende) pas(volgende, true);
    };
    zoomOut.addEventListener("click", () => stap(-1));
    zoomIn.addEventListener("click", () => stap(1));
    pas(huidig, false);
  }

  /* ---- Accessibility preferences (reduce motion / high contrast) ---- */
  const motionCb = document.querySelector(".a11y-motion");
  const contrastCb = document.querySelector(".a11y-contrast");
  if (motionCb && contrastCb) {
    const getLS = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
    const applyMotion = (on) => {
      if (on) document.documentElement.dataset.motion = "reduce";
      else document.documentElement.removeAttribute("data-motion");
      motionCb.checked = on;
    };
    const applyContrast = (on) => {
      if (on) document.documentElement.dataset.contrast = "high";
      else document.documentElement.removeAttribute("data-contrast");
      contrastCb.checked = on;
    };
    applyMotion(getLS("cv-motion") === "reduce");
    applyContrast(getLS("cv-contrast") === "high");
    motionCb.addEventListener("change", () => {
      applyMotion(motionCb.checked);
      setLS("cv-motion", motionCb.checked ? "reduce" : "no");
    });
    contrastCb.addEventListener("change", () => {
      applyContrast(contrastCb.checked);
      setLS("cv-contrast", contrastCb.checked ? "high" : "no");
    });
  }

  /* ---- Duur bij elke periode ----
     Uit data-periode="2019-09/2026-09" (of "/nu" voor wat nog loopt). Het
     einde telt niet mee, zoals bij een gewone looptijd: sep 2019 tot sep 2026
     is zeven jaar. Een periode die nu nog loopt, rekent tot vandaag en blijft
     dus vanzelf kloppen. Staat er enkel een jaartal, dan tellen we hele jaren.
     De duur komt naast de datum en niet erin: de vertaling vervangt de inhoud
     van de datum bij elke taalwissel. */
  const zetDuur = () => {
    const en = document.documentElement.lang === "en";
    const nu = new Date();
    document.querySelectorAll(".row-when[data-periode]").forEach((el) => {
      const [van, tot] = el.dataset.periode.split("/");
      const [vj, vm] = van.split("-").map(Number);
      let maanden;
      if (!vm) {
        maanden = 12 * (nu.getFullYear() - vj);
      } else {
        const [tj, tm] = tot === "nu" ? [nu.getFullYear(), nu.getMonth() + 1] : tot.split("-").map(Number);
        maanden = (tj - vj) * 12 + (tm - vm);
      }
      if (maanden < 1) maanden = 1;
      const j = Math.floor(maanden / 12), m = maanden % 12;
      const delen = [];
      if (j) delen.push(j + (en ? (j === 1 ? " yr" : " yrs") : " jaar"));
      if (m) delen.push(m + (en ? (m === 1 ? " mo" : " mos") : " mnd"));
      let uit = el.querySelector(".row-dur");
      if (!uit) { uit = document.createElement("span"); uit.className = "row-dur"; el.appendChild(uit); }
      uit.textContent = delen.join(" ");
    });
  };
  zetDuur();
  window.addEventListener("cv-layout", zetDuur);

  /* ---- Lichte versie ----
     De kop zet data-mode al voor de eerste paint; hier enkel de knop, het
     bewaren en de kleur van de adresbalk op een telefoon. Het label zegt waar
     de knop naartoe gaat, en volgt de taal. */
  const modeBtn = document.querySelector(".mode-toggle");
  if (modeBtn) {
    const themaKleur = document.querySelector('meta[name="theme-color"]');
    const zetLabel = () => {
      const licht = document.documentElement.dataset.mode === "light";
      const en = document.documentElement.lang === "en";
      modeBtn.setAttribute("aria-pressed", String(licht));
      modeBtn.setAttribute("aria-label", licht ? (en ? "Dark version" : "Donkere versie") : (en ? "Light version" : "Lichte versie"));
    };
    const zetModus = (licht) => {
      if (licht) document.documentElement.dataset.mode = "light";
      else document.documentElement.removeAttribute("data-mode");
      if (themaKleur) themaKleur.content = licht ? "#f6f1ea" : "#0c0a0a";
      try { localStorage.setItem("cv-modus", licht ? "light" : "dark"); } catch (e) {}
      zetLabel();
    };
    modeBtn.addEventListener("click", () => zetModus(document.documentElement.dataset.mode !== "light"));
    window.addEventListener("cv-layout", zetLabel);
    zetLabel();
  }

  /* ---- Welke sectie is in beeld: het menu-item onderlijnen ----
     De sectie waar een leeslijn iets boven het midden van het scherm door
     loopt. Onderaan gekomen wint de laatste sectie, ook als ze korter is dan
     wat er onder die lijn overblijft. */
  const secs = [...document.querySelectorAll(".sec[id]")];
  const navAs = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (secs.length && navAs.length) {
    let current = "";
    const kies = () => {
      const lijn = window.innerHeight * 0.42;
      let gekozen = null;
      for (const s of secs) if (s.getBoundingClientRect().top <= lijn) gekozen = s;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) gekozen = secs[secs.length - 1];
      const id = gekozen ? gekozen.id : "";
      if (id === current) return;
      current = id;
      navAs.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      /* het lijntje krijgt het accent van dat hoofdstuk: dat van zijn eerste
         palet (.grade), dus bij Opleiding petrol, ook in de masterproef */
      if (gekozen) {
        const palet = gekozen.classList.contains("grade") ? gekozen : gekozen.querySelector(".grade");
        if (palet) navLijst.style.setProperty("--nav-acc", getComputedStyle(palet).getPropertyValue("--g-acc").trim());
      }
    };
    const navLijst = document.querySelector(".nav-links");
    // één keer per beeld (scroll vuurt vaker), en niet in de compacte weergave:
    // daar zijn de secties verborgen en stuurt stapel.js het menu
    let kiesRaf = 0;
    const planKies = () => { if (!kiesRaf && wortel.dataset.view !== "compact") kiesRaf = requestAnimationFrame(() => { kiesRaf = 0; kies(); }); };
    addEventListener("scroll", planKies, { passive: true });
    addEventListener("resize", planKies);
    // na een wissel tussen licht en donker verandert elk accent: opnieuw kiezen
    new MutationObserver(() => { current = ""; kies(); }).observe(wortel, { attributes: true, attributeFilter: ["data-mode"] });
    kies();
  }

  /* ---- Diploma lightbox ---- */
  const lb = document.querySelector(".lightbox");
  if (lb) {
    const lbImg = lb.querySelector("img");
    /* De lichtbak is een venster: de focus gaat naar de sluitknop en blijft
       daar tot je sluit, en keert dan terug naar de knop waarmee je opende.
       Zo weet een toetsenbord- of schermlezergebruiker dat er iets openging. */
    const lbSluit = lb.querySelector(".lightbox-close");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    let lbTerug = null;
    const isEnLb = () => document.documentElement.lang === "en";
    const open = (src, alt) => {
      lbImg.src = src; lbImg.alt = alt || "";
      lb.setAttribute("aria-label", alt || (isEnLb() ? "Image" : "Afbeelding"));
      lbSluit.setAttribute("aria-label", isEnLb() ? "Close" : "Sluiten");
      lbTerug = document.activeElement;
      lb.classList.add("open"); document.body.style.overflow = "hidden";
      lbSluit.focus({ preventScroll: true });
    };
    const close = () => {
      if (!lb.classList.contains("open")) return;
      lb.classList.remove("open"); document.body.style.overflow = "";
      if (lbTerug && lbTerug.focus) lbTerug.focus({ preventScroll: true });
    };
    lb.addEventListener("keydown", (e) => { if (e.key === "Tab") { e.preventDefault(); lbSluit.focus(); } });
    // .doc-btn is de kleine knop bij de diplomas: die heeft geen voorbeeldbeeld,
    // dus komen pad en omschrijving daar uit data-attributen.
    // .doc-link is geen vergrootglas maar een echte link naar een volledig
    // document: die moet de lichtbak met rust laten, anders opent het beeld
    // van de titelpagina en gaat de link niet door.
    // Enkel knoppen met een beeld (data-full): de knoppen van de referenties
    // dragen ook .doc-btn voor hun uiterlijk, maar openen een eigen venster.
    document.querySelectorAll(".diploma-thumb:not(.doc-link), .doc-btn[data-full]").forEach((t) => {
      const img = t.querySelector("img");
      t.addEventListener("click", () =>
        open(t.dataset.full || (img && img.src), t.dataset.alt || (img && img.alt)));
    });
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lightbox-close")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---- Voorproefvenster bij de volledige documenten ----
     Een klik op zo'n titelpagina leidde eerst rechtstreeks naar de PDF, en
     een browser begint die dan meteen te halen - vijf megabyte voor wie enkel
     even wilde kijken. Nu opent er eerst een venster met de eerste pagina's in
     verlaagde resolutie; pas de knop onderaan haalt het echte bestand op.
     De pagina's zijn vooraf gerenderde JPEG's: het venster hoeft dus zelf geen
     PDF te lezen, wat precies de download zou zijn die we willen vermijden. */
  const docbox = document.querySelector(".docbox");
  const docKnoppen = [...document.querySelectorAll(".doc-link")];
  if (docbox && docKnoppen.length) {
    const blad = docbox.querySelector(".docbox-blad");
    const titelEl = docbox.querySelector("#docbox-titel");
    const vraag = docbox.querySelector(".docbox-vraag");
    const dl = docbox.querySelector(".docbox-dl");
    const dlTxt = docbox.querySelector(".docbox-dl-txt");
    const sluitKnop = docbox.querySelector(".docbox-sluit");

    const sjabloon = (naam) => {
      const el = docbox.querySelector('[data-sjabloon="' + naam + '"]');
      return el ? el.textContent : "";
    };
    const vulIn = (tekst, waarden) =>
      tekst.replace(/\{(\w+)\}/g, (m, k) => (k in waarden ? waarden[k] : m));
    /* Megabytes met één cijfer na de komma, in de schrijfwijze van de taal:
       5,7 in het Nederlands en 5.7 in het Engels. */
    const inMb = (bytes) =>
      (bytes / 1048576).toLocaleString(document.documentElement.lang === "en" ? "en" : "nl", {
        minimumFractionDigits: 1, maximumFractionDigits: 1,
      }) + " MB";

    let huidig = null;
    let vorigeFocus = null;

    const vulVoet = () => {
      if (!huidig) return;
      const heel = huidig.voorproef >= huidig.paginas;
      vraag.textContent = vulIn(sjabloon(heel ? "heel" : "deel"), { n: huidig.voorproef, tot: huidig.paginas });
      dlTxt.textContent = vulIn(sjabloon("dl"), { grootte: inMb(huidig.bytes) });
    };

    const dicht = () => {
      if (!huidig) return;
      huidig = null;
      docbox.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(() => { if (!huidig) docbox.hidden = true; }, 260);
      if (vorigeFocus) vorigeFocus.focus();
    };

    const open = (knop) => {
      const d = knop.dataset;
      huidig = {
        slug: d.docSlug,
        pad: d.doc,
        paginas: parseInt(d.docPages, 10) || 0,
        voorproef: parseInt(d.docPreview, 10) || 0,
        bytes: parseInt(d.docBytes, 10) || 0,
      };
      vorigeFocus = knop;
      const item = knop.closest(".design-item");
      // de titel komt uit het bijschrift, zodat hij vanzelf de taal volgt
      huidig.kop = item && item.querySelector(".design-cap-t");
      titelEl.textContent = huidig.kop ? huidig.kop.textContent : "";

      blad.textContent = "";
      for (let n = 1; n <= huidig.voorproef; n++) {
        const img = document.createElement("img");
        img.className = "docbox-pagina";
        img.src = "assets/docs/voorproef/" + huidig.slug + "-" + n + ".jpg";
        img.alt = vulIn(sjabloon("pagina"), { n: n });
        // de eerste pagina is meteen in beeld, de rest pas als je scrolt
        if (n > 1) img.loading = "lazy";
        blad.appendChild(img);
      }
      blad.scrollTop = 0;

      dl.href = huidig.pad;
      vulVoet();

      docbox.hidden = false;
      requestAnimationFrame(() => docbox.classList.add("open"));
      document.body.style.overflow = "hidden";
      sluitKnop.focus();
    };

    docKnoppen.forEach((knop) => knop.addEventListener("click", () => open(knop)));
    docbox.addEventListener("click", (e) => {
      if (e.target === docbox || e.target.closest(".docbox-sluit")) dicht();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") dicht(); });
    /* Bij een taalwissel zijn de sjablonen vertaald, maar alles wat daar al uit
       gevuld is nog niet: de zinnen onderaan, de titel die uit het bijschrift
       komt, de opschriften bij de pagina's en het label van de sluitknop. */
    const vertaalMee = () => {
      sluitKnop.setAttribute("aria-label", sjabloon("sluit"));
      if (huidig && huidig.kop) titelEl.textContent = huidig.kop.textContent;
      blad.querySelectorAll(".docbox-pagina").forEach((img, i) => {
        img.alt = vulIn(sjabloon("pagina"), { n: i + 1 });
      });
      vulVoet();
    };
    window.addEventListener("cv-layout", vertaalMee);
    // applyLang draait eerder in dit bestand dan dit blok, dus de eerste ronde
    // is al voorbij: een keer zelf inhalen
    vertaalMee();
  }

  /* ---- Uitklappen van de galerijen ----
     Een <details> springt open en dicht. Hier glijdt hij: de hoogte loopt
     vloeiend naar de nieuwe maat, de galerij komt een paar pixels omhoog en
     fadet in, en de waaier van kaartjes schuift samen en vervaagt in plaats
     van in één beeld te verdwijnen. Dichtklappen gaat iets sneller, omdat
     wie dichtklapt al verder wil. De waaier ligt tijdens de overgang los
     (absoluut) op zijn oude plaats, anders verspringt de kopregel. */
  const rustigMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
  document.querySelectorAll("details.fold").forEach((d) => {
    const sum = d.querySelector(":scope > summary"), peek = d.querySelector(".fold-peek"), inh = d.querySelector(":scope > .gallery");
    if (!sum || !inh) return;
    let anim = null;
    const zetPeek = () => {
      if (!peek) return;
      const s = sum.getBoundingClientRect(), r = peek.getBoundingClientRect();
      peek.style.left = (r.left - s.left) + "px"; peek.style.top = (r.top - s.top) + "px";
    };
    const klaar = () => {
      d.classList.remove("fold-anim", "fold-sluit"); d.style.height = ""; d.style.overflow = "";
      if (peek) { peek.style.left = peek.style.top = ""; peek.getAnimations().forEach((a) => a.cancel()); }
      inh.getAnimations().forEach((a) => a.cancel());
      anim = null;
    };
    sum.addEventListener("click", (e) => {
      if (rustigMotion() || !d.animate) return;
      e.preventDefault();
      const open = !d.open;
      const van = anim ? d.getBoundingClientRect().height : d.offsetHeight;
      if (anim) { anim.onfinish = null; anim.cancel(); klaar(); }
      if (open) zetPeek();
      d.open = true;                                   // ook bij dichtklappen blijft de inhoud tot het einde staan
      if (!open) { d.open = false; zetPeek(); d.open = true; }
      d.classList.add("fold-anim");
      d.classList.toggle("fold-sluit", !open);
      const naar = open ? d.offsetHeight : (() => { d.open = false; const h = d.offsetHeight; d.open = true; return h; })();
      d.style.overflow = "hidden";
      const duur = open ? 420 : 300, ease = "cubic-bezier(.2, .8, .2, 1)";
      anim = d.animate({ height: [van + "px", naar + "px"] }, { duration: duur, easing: ease });
      inh.animate(open ? { opacity: [0, 1], transform: ["translateY(10px)", "none"] } : { opacity: [1, 0], transform: ["none", "translateY(6px)"] },
        { duration: open ? duur : 200, easing: ease, fill: "both" });
      if (peek) peek.animate(open ? { opacity: [1, 0], transform: ["none", "scale(.92) translateX(16px)"] } : { opacity: [0, 1], transform: ["scale(.92) translateX(16px)", "none"] },
        { duration: open ? 220 : duur, easing: ease, fill: "both" });
      anim.onfinish = () => { if (!open) d.open = false; klaar(); };
    });
  });

  /* ---- Masterproef uitklappen ("Spiegeling") ----
     De masterproef staat eerst ingeklapt (Victors keuze, nov 2026): een strook
     van de foto met de titel en zijn weerspiegeling. De knop laat de foto
     groeien tot haar volle hoogte en vouwt de inhoud eronder open; de css doet
     de inhoud (rasterrij van 0fr naar 1fr), hier enkel de hoogte van de foto,
     want een aspect-ratio laat zich niet overgaan. Wie via een link naar
     #masterproef komt (het adres, of "Lees verder" in de compacte weergave),
     krijgt ze meteen open. Zonder script staat alles open. */
  (() => {
    const sec = document.getElementById("masterproef");
    const knop = sec && sec.querySelector(".mp-knop");
    const vouw = sec && sec.querySelector(".mp-vouw");
    const img = sec && sec.querySelector(".mp-frame img");
    if (!sec || !knop || !vouw || !img) return;
    const rustig = () => matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
    const zet = (open) => {
      sec.classList.toggle("mp-dicht", !open);
      knop.setAttribute("aria-expanded", String(open));
      if (open) vouw.removeAttribute("inert"); else vouw.setAttribute("inert", "");
    };
    /* zelfde tempo en uitloop als de css (.mp-vouw): openen 700 ms, sluiten 500 ms */
    const EASE = "cubic-bezier(.32, .72, 0, 1)";
    let bezig = false;
    const wissel = (open) => {
      if (bezig || open === !sec.classList.contains("mp-dicht")) return;
      const rust = rustig();
      const doe = () => {
        /* offsetHeight, geen getBoundingClientRect: met de muis op de knop staat
           de foto in haar hoverzoom (2 % groter), en dan eindigde de animatie
           op een te grote maat en schokte de foto daarna naar haar echte maat */
        const van = img.offsetHeight;
        zet(open);
        if (rust || !img.animate) return;
        const naar = img.offsetHeight;
        bezig = true;
        const a = img.animate([{ height: van + "px" }, { height: naar + "px" }], { duration: open ? 700 : 500, easing: EASE });
        a.onfinish = a.oncancel = () => { bezig = false; };
      };
      /* Dichtklappen van onderaan: eerst rustig terug naar de foto, dan pas
         dicht. Tegelijk liep het scrollen en het krimpen door elkaar, en schoof
         de pagina onder je door. */
      const top = sec.getBoundingClientRect().top;
      const balk = (document.querySelector(".nav") || { offsetHeight: 0 }).offsetHeight;
      if (!open && top < balk) {
        bezig = true;
        let klaar = false;
        const verder = () => { if (klaar) return; klaar = true; removeEventListener("scrollend", verder); bezig = false; doe(); };
        addEventListener("scrollend", verder);
        setTimeout(verder, rust ? 0 : 700);
        sec.scrollIntoView({ behavior: rust ? "auto" : "smooth", block: "start" });
        return;
      }
      doe();
    };
    knop.hidden = false;
    if (location.hash !== "#masterproef") zet(false);
    knop.addEventListener("click", () => wissel(sec.classList.contains("mp-dicht")));
    const openNaarLink = () => { if (location.hash === "#masterproef") zet(true); };
    addEventListener("hashchange", openNaarLink);
    /* capture: vóór stapel.js, dat bij "Lees verder" zelf naar de sectie springt */
    document.addEventListener("click", (e) => {
      const a = e.target.closest && e.target.closest('a[href="#masterproef"]');
      if (a) zet(true);
    }, true);
  })();

})();
