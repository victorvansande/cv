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

  /* ---- Prisma-intro: de naamlagen klonen uit de echte h1 ----
     De h1 gebruikt `text-wrap: balance`, die de regels verdeelt over de hele
     kop ("Hallo, ik ben" + de naam). Een kopie die alleen de naam bevat komt
     daardoor op een andere regelval uit, vandaar dat er eerder een tweede
     "Sande" op een eigen regel kon belanden. Door de volledige h1 te klonen en
     daarin alles behalve de naam onzichtbaar te zetten, is de zetting per
     definitie identiek: zelfde inhoud, zelfde breedte, zelfde balancering. */
  /* Wie beweging beperkt krijgt de intro niet te zien: de CSS verbergt de laag.
     Dan moet de klasse ook meteen weg. Zonder dit blijft het scrollslot ruim
     negen seconden dicht voor een animatie die helemaal niet speelt - de laag
     is immers display: none, dus er komt ook nooit een animationend. */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduce") {
    document.documentElement.classList.remove("intro", "go");
    const stilleVeil = document.querySelector(".intro-veil");
    if (stilleVeil) stilleVeil.remove();
  }
  if (document.documentElement.classList.contains("intro")) {
    const veil = document.querySelector(".intro-veil");
    const stage = veil && veil.querySelector(".intro-stage");
    const host = document.querySelector(".prism-host");
    const real = host && host.querySelector(".grad-text");
    if (veil && stage && host && real) {
      // de flitslaag komt als laatste, dus bovenop de scherpe letters
      const copies = ["in-b3", "in-b1", "in-b0", "in-flash"].map((cls) => {
        const clone = host.cloneNode(true);
        clone.classList.add("in-l", cls);
        clone.removeAttribute("id");
        // i18n moet de klonen negeren: ze leven maar een paar seconden
        clone.querySelectorAll("[data-i18n]").forEach((el) => el.removeAttribute("data-i18n"));
        // alles behalve de naam onzichtbaar, maar wel ruimte latend innemen
        clone.querySelectorAll(":scope > *:not(.grad-text)").forEach((el) => el.classList.add("intro-hidden"));
        stage.appendChild(clone);
        return clone;
      });
      let last = "";
      const place = () => {
        const h = host.getBoundingClientRect();
        const r = real.getBoundingClientRect();
        const key = h.left + "|" + h.top + "|" + h.width + "|" + r.top + "|" + r.height;
        if (key === last) return;
        last = key;
        // de klonen liggen op de h1 zelf, niet op de naam: zo klopt de regelval
        stage.style.left = h.left + "px";
        stage.style.top = h.top + "px";
        stage.style.width = h.width + "px";
        stage.style.height = h.height + "px";
        copies.forEach((c) => { c.style.width = h.width + "px"; });
        // explosie en lichtspill centreren op het midden van de naam
        veil.style.setProperty("--nx", r.left + r.width / 2 + "px");
        veil.style.setProperty("--ny", r.top + r.height / 2 + "px");
      };
      /* De echte naam beweegt vooral in het begin: de hero-kaart schuift omhoog
         (.reveal, 0.8s) en het webfont kan later binnenkomen. Daarvoor volgen we
         elk frame. Elke meting dwingt de browser tot een layout-herberekening,
         dus dat doen we enkel zolang er nog iets kan schuiven; daarna volstaan
         scroll- en resize-events, die alleen vuren als er echt iets verandert. */
      let tracking = true, live = true;
      const track = () => { if (!tracking) return; place(); requestAnimationFrame(track); };
      place();
      requestAnimationFrame(track);
      setTimeout(() => { tracking = false; }, 1800);
      const onMove = () => { if (live) place(); };
      addEventListener("scroll", onMove, { passive: true });
      addEventListener("resize", onMove, { passive: true });
      /* rAF ligt stil in een achtergrondtab; deze hermetingen vuren wél en vangen
         het uitklappen van de hero-kaart en het laden van het webfont op, zodat
         de laag ook dan exact blijft liggen. */
      [80, 260, 520, 900, 1400].forEach((ms) => setTimeout(place, ms));

      /* De startpoort openen. Wachten op het webfont is niet alleen netjes voor
         de uitlijning: als het lettertype halverwege binnenkomt, moeten de drie
         vervaagde naamlagen opnieuw gerasterd worden, en dat is midden in de
         animatie goed zichtbaar. De twee frames erna geven de browser de kans
         het eerste beeld rustig neer te zetten. Het scherm is zwart, dus dit
         wachten kost visueel niets - maar er zit een dop op, zodat een traag
         lettertype de intro nooit tegenhoudt. */
      const ready = Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 900)),
      ]);
      ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        place();
        document.documentElement.classList.add("go");
      })));
      /* De intro houdt de pagina niet tegen en wordt ook niet afgekapt: er staat
         geen slot op het scrollen, en wie toch scrolt laat de animatie gewoon
         uitspelen. Ze duurt bijna zeven seconden en is bedoeld om gezien te
         worden.
         De naamlagen blijven daarbij op de echte naam liggen: onMove hierboven
         meet bij elke scroll opnieuw waar de h1 staat en legt de lagen daarop.
         Scrol je ver door, dan reist de animatie dus mee met de kop en verlaat
         ze het beeld - ze speelt wel af, je kijkt er alleen niet meer naar. */

      const done = () => {
        tracking = false;
        live = false;
        removeEventListener("scroll", onMove);
        removeEventListener("resize", onMove);
        veil.remove();
        /* Ook de klassen weg: anders houdt de pauzeregel de echte naam
           verborgen als de poort door een fout nooit geopend zou zijn. */
        document.documentElement.classList.remove("intro", "go");
      };
      veil.addEventListener("animationend", (e) => { if (e.animationName === "intro-end") done(); });
      /* Vangnet, zodat de laag nooit blijft hangen als animationend uitblijft.
         De teller start pas als de pagina zichtbaar is: in een achtergrondtab
         bevriest de browser de animatie, en dan mag de intro niet al weggegooid
         zijn tegen dat de bezoeker gaat kijken. */
      // ruim na het einde van de animatie (6,6s + 0,12s aanloop), anders zou dit
      // vangnet de intro voortijdig afkappen
      const arm = () => setTimeout(done, 9000);
      if (document.visibilityState === "visible") arm();
      else {
        document.addEventListener("visibilitychange", function onVis() {
          if (document.visibilityState !== "visible") return;
          document.removeEventListener("visibilitychange", onVis);
          arm();
        });
      }
    }
  }

  /* ---- Klik op de naam: de letters stralen kleur uit ----
     Niet één bloei uit een middelpunt, maar drie kopieën van de naam zelf met
     elk een vaste blur. Ze schalen op en vloeien weg, dus de gloed heeft in de
     eerste frames precies de vorm van de glyphs en diffundeert daarna pas.
     De blur staat vast en enkel transform/opacity animeren, zodat elke laag
     één keer gerasterd wordt en daarna alleen nog gecomposit.
     De h1 wordt in zijn geheel gekloond: alleen zo valt de regelval (die door
     text-wrap: balance bepaald wordt) gegarandeerd identiek uit. */
  /* De luisteraar hangt aan het document en zoekt de naam pas op bij de klik.
     Dat is nodig omdat de intro klonen van de h1 maakt die de klasse
     prism-host meedragen, en de introlaag vóór de hero in de DOM staat: een
     directe querySelector greep dus de kloon, en die verdwijnt samen met de
     laag zodra de intro klaar is. Daardoor werkte de klik enkel bij een
     herbezoek binnen dezelfde sessie, wanneer de intro niet meer speelt.
     De :not(.in-l) sluit de introlagen uit, net als in de bijbehorende CSS. */
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let current = null;
    document.addEventListener("click", (ev) => {
      const glowName = ev.target.closest(".prism-host:not(.in-l) .grad-text");
      if (!glowName) return;
      const glowHost = glowName.closest(".prism-host");
      if (document.documentElement.dataset.motion === "reduce") return;
      // hoogstens één gloed tegelijk: snel achter elkaar klikken stapelt niet op
      if (current) current.remove();
      const h = glowHost.getBoundingClientRect();
      const r = glowName.getBoundingClientRect();
      const wrap = document.createElement("div");
      wrap.className = "name-glow";
      wrap.setAttribute("aria-hidden", "true");
      wrap.style.left = h.left + "px";
      wrap.style.top = h.top + "px";
      wrap.style.width = h.width + "px";
      wrap.style.height = h.height + "px";
      /* Draaipunt op het midden van de NAAM, niet van de h1. De kop is zo breed
         als de kaart terwijl de naam links uitlijnt; schalen om het midden van
         de kop duwt de gloed dan zichtbaar naar links weg. */
      wrap.style.setProperty("--ox", r.left + r.width / 2 - h.left + "px");
      wrap.style.setProperty("--oy", r.top + r.height / 2 - h.top + "px");
      // gl-flash als laatste, dus bovenop de kleurlagen
      ["gl-near", "gl-mid", "gl-far", "gl-flash"].forEach((cls) => {
        const clone = glowHost.cloneNode(true);
        clone.classList.remove("prism-host");   // anders erft de kloon de hover-regels
        clone.classList.add("gl", cls);
        clone.removeAttribute("id");
        clone.querySelectorAll("[data-i18n]").forEach((el) => el.removeAttribute("data-i18n"));
        clone.querySelectorAll(":scope > *:not(.grad-text)").forEach((el) => el.classList.add("intro-hidden"));
        clone.style.width = h.width + "px";
        wrap.appendChild(clone);
      });
      document.body.appendChild(wrap);
      current = wrap;
      const clear = () => { if (current === wrap) current = null; wrap.remove(); };
      // animationend borrelt op vanuit de lagen; de traagste bepaalt het einde
      wrap.addEventListener("animationend", (e) => {
        if (e.target.classList.contains("gl-far")) clear();
      });
      setTimeout(clear, 4000);
    });
  }

  /* ---- Getallen volgens de taal ----
     Het getal staat al in de html, zodat een schermlezer of een bezoeker
     zonder javascript het altijd leest. Hier krijgt het enkel het juiste
     scheidingsteken: 14.716 in het Nederlands, 14,716 in het Engels. Er telt
     niets meer op; dat was beweging zonder nut. */
  const hertelGetallen = () => document.querySelectorAll("[data-count]").forEach((el) => {
    const n = parseFloat(el.dataset.count);
    el.textContent = n.toLocaleString(document.documentElement.lang === "en" ? "en" : "nl") + (el.dataset.suffix || "");
  });

  /* ---- Language switch (NL / EN) ---- */
  const I18N = (window.I18N && window.I18N.en) || {};
  const langBtn = document.querySelector(".lang-toggle");
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
  const applyLang = (lang) => {
    const en = lang === "en";
    document.documentElement.lang = en ? "en" : "nl";
    zetKop(en);
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = (en && I18N[key] != null) ? I18N[key] : el.dataset.nlHtml;
    });
    try { localStorage.setItem("cv-lang", lang); } catch (e) {}
    if (langBtn) langBtn.setAttribute("aria-label", en ? "Schakel naar Nederlands · Switch to Dutch" : "Switch to English · Schakel naar Engels");
    hertelGetallen();
    // het voorproefvenster vertaalt zijn eigen ingevulde zinnen mee
    window.dispatchEvent(new Event("cv-layout"));
  };
  if (langBtn) langBtn.addEventListener("click", () =>
    applyLang(document.documentElement.lang === "en" ? "nl" : "en"));
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
    };
    addEventListener("scroll", kies, { passive: true });
    addEventListener("resize", kies);
    kies();
  }

  /* ---- Diploma lightbox ---- */
  const lb = document.querySelector(".lightbox");
  if (lb) {
    const lbImg = lb.querySelector("img");
    const open = (src, alt) => { lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
    // .doc-btn is de kleine knop bij de diplomas: die heeft geen voorbeeldbeeld,
    // dus komen pad en omschrijving daar uit data-attributen.
    // .doc-link is geen vergrootglas maar een echte link naar een volledig
    // document: die moet de lichtbak met rust laten, anders opent het beeld
    // van de titelpagina en gaat de link niet door.
    document.querySelectorAll(".diploma-thumb:not(.doc-link), .doc-btn").forEach((t) => {
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

})();
