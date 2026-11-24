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
    const done = () => wortel.classList.remove("intro", "go");
    if (naam) naam.addEventListener("animationend", (e) => { if (e.animationName === "v-name") done(); });
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
    Promise.all([klaar, window.__velWeg || Promise.resolve()]).then(() => {
      plaats();
      requestAnimationFrame(() => requestAnimationFrame(() => { wortel.classList.add("go"); wapen(); }));
    });
  }

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
    hero.appendChild(pil);
    const img = pil.firstChild;
    const KOPX = 0.41, KOP = 0.33;          // plaats van het hoofd in de foto (0 tot 1)
    const ZOOM = 1.25;
    const meet = document.createElement("canvas").getContext("2d");
    const zet = () => {
      if (wortel.classList.contains("intro") || wortel.dataset.view === "compact") { pil.classList.remove("toon"); return; }
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
      if (regels.length < 2 || !kap || !asc) { pil.classList.remove("toon"); return; }
      const fs = parseFloat(cs.fontSize);
      const hr = hero.getBoundingClientRect();
      const links = regels[0].right + fs * 0.14, rechts = Math.max(regels[1].right, regels[0].right);
      const breed = rechts - links, hoog = kap;
      if (breed < hoog * 1.3) { pil.classList.remove("toon"); return; }
      pil.style.left = (links - hr.left).toFixed(1) + "px";
      pil.style.top = (regels[0].top + asc - kap - hr.top).toFixed(1) + "px";
      pil.style.width = breed.toFixed(1) + "px";
      pil.style.height = hoog.toFixed(1) + "px";
      // het hoofd in het midden van de pil: de foto staat iets ingezoomd en
      // schuift zo dat het hoofd centraal staat, zonder dat er rand zichtbaar wordt
      const z = Math.max(breed, hoog) * ZOOM;
      const kl = (v, min) => Math.min(0, Math.max(min, v));
      img.style.width = img.style.height = z.toFixed(1) + "px";
      img.style.left = kl(breed / 2 - KOPX * z, breed - z).toFixed(1) + "px";
      img.style.top = kl(hoog / 2 - KOP * z, hoog - z).toFixed(1) + "px";
      pil.classList.add("toon");
    };
    const plan = () => requestAnimationFrame(zet);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(plan);
    addEventListener("resize", plan);
    addEventListener("cv-layout", plan);
    new MutationObserver(plan).observe(wortel, { attributes: true, attributeFilter: ["class", "data-view", "style"] });
  })();

  /* ---- De naam na de intro: één lichtglans, daarna Tech Text bij hover ----
     Zodra alle animaties gespeeld hebben (de klasse intro is weg), schuift er
     één keer een lichtband over de naam. Daarna wordt de naam bij hover een
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
    const glans = () => {
      naamTekst.classList.remove("glans");
      void naamTekst.offsetWidth;          // reflow, anders herstart de animatie niet
      naamTekst.classList.add("glans");
    };
    naamTekst.addEventListener("animationend", (e) => { if (e.animationName === "naam-glans") naamTekst.classList.remove("glans"); });

    const zetKlaar = () => {
      if (klaar || wortel.classList.contains("intro")) return;
      klaar = true;
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
      if (!geenBeweging()) glans();

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

  /* ---- Grainient op de knoppen in de hero ----
     Het korrelige verloop volgt de cursor een beetje: de lichtste vlek staat
     waar de muis is. De rest (de kleuren, de korrel, het drijven) zit in css.
     De trefwoorden (.tags span) krijgen hetzelfde, in het accent van hun sectie. */
  document.querySelectorAll(".hero-side .btn, .tags span").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      b.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
  });

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

  /* ---- Getallen die optellen, met bewegingsonscherpte ----
     Het eindgetal staat al in de html, zodat een schermlezer of een bezoeker
     zonder javascript het altijd leest. Hier wordt elk getal opgesplitst in
     drie delen: een verborgen tekst met het eindgetal voor schermlezers
     (.tel-sr), een onzichtbare kopie die de breedte vasthoudt (.tel-maat,
     zodat er niets verspringt), en de zichtbare kopie (.tel-live, aria-hidden)
     die bij het in beeld komen optelt. Cijfers die te snel draaien om te lezen,
     worden wazig en scherpen aan naarmate ze vertragen, zoals een echte
     teller. Eén keer per bezoek, niet bij minder beweging. Het scheidingsteken
     volgt de taal: 14.716 in het Nederlands, 14,716 in het Engels. */
  const telTaal = () => (document.documentElement.lang === "en" ? "en" : "nl");
  const telTekst = (el, n) => n.toLocaleString(telTaal()) + (el.dataset.suffix || "");
  const telBouw = (el) => {
    if (el.querySelector(".tel-sr")) return;
    const t = el.textContent;
    el.innerHTML = '<span class="tel-sr"></span><span class="tel-num" aria-hidden="true"><span class="tel-maat"></span><span class="tel-live"></span></span>';
    el.querySelectorAll(".tel-sr, .tel-maat, .tel-live").forEach((d) => { d.textContent = t; });
  };
  const telTeken = (el, t) => {
    const doel = parseFloat(el.dataset.count), duur = 2200, maxWaas = 6;
    const v = Math.round(doel * (1 - Math.pow(1 - t, 4)));
    // hoeveel eenheden er per beeld voorbijkomen: daaruit volgt per cijfer hoe wazig het is
    const snel = t >= 1 ? 0 : doel * 4 * Math.pow(1 - t, 3) * 16 / duur;
    const tekens = [...telTekst(el, v)];
    let plaats = tekens.filter((c) => /\d/.test(c)).length;
    const live = el.querySelector(".tel-live");
    live.textContent = "";
    tekens.forEach((c) => {
      const sp = document.createElement("span");
      sp.textContent = c;
      if (!/\d/.test(c)) { sp.className = "tel-sep"; live.appendChild(sp); return; }
      plaats--;
      const waas = Math.min(maxWaas, Math.max(0, (snel / Math.pow(10, plaats) - 0.15) * 5));
      sp.className = "tel-d";
      if (waas > .05) {
        sp.style.filter = "blur(" + waas.toFixed(2) + "px)";
        sp.style.transform = "scaleY(" + (1 + waas * .02).toFixed(3) + ")";
        sp.style.opacity = (1 - waas * .06).toFixed(3);
      }
      live.appendChild(sp);
    });
  };
  const hertelGetallen = () => document.querySelectorAll("[data-count]").forEach((el) => {
    const n = parseFloat(el.dataset.count);
    if (!el.querySelector(".tel-sr")) { el.textContent = telTekst(el, n); return; }
    el.querySelectorAll(".tel-sr, .tel-maat").forEach((d) => { d.textContent = telTekst(el, n); });
    if (el.classList.contains("wacht")) telTeken(el, 0);
    else if (!el.classList.contains("telt")) el.querySelector(".tel-live").textContent = telTekst(el, n);
  });
  (() => {
    const tellers = [...document.querySelectorAll("[data-count]")];
    const stil = matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
    if (stil || !("IntersectionObserver" in window)) return;
    tellers.forEach(telBouw);
    const start = (el) => {
      el.classList.remove("wacht"); el.classList.add("telt");
      let t0 = 0;
      const stap = (nu) => {
        if (!t0) t0 = nu;
        const t = Math.min(1, (nu - t0) / 2200);
        telTeken(el, t);
        if (t < 1) requestAnimationFrame(stap);
        else { el.classList.remove("telt"); el.querySelector(".tel-live").textContent = telTekst(el, parseFloat(el.dataset.count)); }
      };
      requestAnimationFrame(stap);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      start(e.target);
    }), { threshold: 0.3 });
    // tot ze in beeld komen, staat er een 0; wie dat nooit ziet, leest het eindgetal via .tel-sr
    tellers.forEach((el) => { el.classList.add("wacht"); telTeken(el, 0); io.observe(el); });
  })();

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
