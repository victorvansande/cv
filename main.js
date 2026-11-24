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

  /* ---- Startscherm: typintro en wegzakken ----
     Bij het eerste bezoek in een sessie (klasse intro, gezet in de kop)
     verschijnen de regels van het startscherm letter per letter. Daarvoor
     krijgt elke letter een eigen span met een volgnummer; de animatie zelf
     staat in style.css. Woorden blijven bij elkaar, zodat de regels breken
     zoals zonder intro. Wie minder beweging wil, of in de compacte weergave
     binnenkomt, krijgt meteen de volledige tekst.
     De vertaling vervangt bij een taalwissel de inhoud van de vertaalde
     stukken; dat mag, want dan is de intro voorbij en hoort de tekst er
     gewoon te staan. */
  const wortel = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce" || wortel.dataset.view === "compact") {
    wortel.classList.remove("intro");
  }
  if (wortel.classList.contains("intro")) {
    let n = 0;
    const splits = (el) => {
      [...el.childNodes].forEach((kn) => {
        if (kn.nodeType === 3) {
          const frag = document.createDocumentFragment();
          kn.textContent.split(/(\s+)/).forEach((stuk) => {
            if (!stuk) return;
            if (/^\s+$/.test(stuk)) { frag.appendChild(document.createTextNode(stuk)); n++; return; }
            const woord = document.createElement("span");
            woord.style.whiteSpace = "nowrap";
            [...stuk].forEach((c) => {
              const l = document.createElement("span");
              l.className = "tl"; l.textContent = c; l.style.setProperty("--i", n++);
              woord.appendChild(l);
            });
            frag.appendChild(woord);
          });
          kn.replaceWith(frag);
        } else if (kn.nodeType === 1) splits(kn);
      });
    };
    // pas na de vertaling (die verderop in dit bestand loopt) opsplitsen
    setTimeout(() => {
    const regels = [...document.querySelectorAll(".start .typ")];
    regels.forEach(splits);
    const laatste = regels[regels.length - 1];
    if (laatste) {
      const caret = document.createElement("span");
      caret.className = "typ-caret"; caret.setAttribute("aria-hidden", "true");
      caret.style.setProperty("--caret-weg", (n * 26 + 1400) + "ms");
      laatste.appendChild(caret);
    }
    wortel.style.setProperty("--links-in", (n * 26 + 350) + "ms");
    wortel.classList.add("typ-klaar");
    // na het typen de klasse weg, zodat de gewone opmaak geldt
    setTimeout(() => wortel.classList.remove("intro", "typ-klaar"), n * 26 + 2200);
    }, 0);
  }

  /* Terwijl de pagina over het startscherm schuift, krimpt het lichtjes en
     vervaagt het, zoals een footer die onder de pagina ligt, maar omgekeerd. */
  const startIn = document.querySelector(".start-inner");
  if (startIn) {
    let wacht = false;
    const zak = () => {
      wacht = false;
      const p = Math.min(1, Math.max(0, scrollY / innerHeight));
      if (wortel.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        startIn.style.transform = ""; startIn.style.opacity = p > 0.98 ? "0" : ""; return;
      }
      startIn.style.transform = p ? "scale(" + (1 - p * 0.06).toFixed(4) + ")" : "";
      startIn.style.opacity = p ? (1 - p * 0.85).toFixed(3) : "";
    };
    addEventListener("scroll", () => { if (!wacht) { wacht = true; requestAnimationFrame(zak); } }, { passive: true });
    zak();
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
