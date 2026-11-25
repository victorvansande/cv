/* ============================================================
   Victor Van Sande - CV website  ·  compacte weergave
   ------------------------------------------------------------
   De hele site als stapel kaarten, één per onderdeel. Bij het scrollen
   schuift de volgende kaart over de vorige; een bedekte kaart krimpt een
   beetje, schuift omhoog zodat haar rand nog uitpiept, en wordt wazig en
   donkerder. Eigen bouw, geïnspireerd op de Scroll Stack van React Bits Pro
   (zonder hun code); de standaardwaarden staan hieronder.

   Aan en uit via de instellingen; de keuze staat onder cv-weergave en wordt
   al in de kop toegepast. Elke kaart krijgt één schermhoogte scrollruimte.
   ============================================================ */
(() => {
  "use strict";

  const S = { peek: 26, scaleStep: 0.07, blur: 4, dim: 0.28, smooth: 0.16, depth: 3 };
  const wortel = document.documentElement;
  const stapel = document.getElementById("compact");
  const knop = document.querySelector(".view-compact");
  if (!stapel) return;
  const podium = stapel.querySelector(".stack-stage");
  const kaarten = [...stapel.querySelectorAll(".stack-card")];
  const balk = stapel.querySelector(".stack-rail i");
  const teller = stapel.querySelector(".stack-count");
  const ui = stapel.querySelector(".stack-ui");
  const voet = stapel.querySelector(".stack-voet");
  const n = kaarten.length;
  const rustig = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const aan = () => wortel.dataset.view === "compact";

  stapel.style.setProperty("--n", n);
  // snap-punten om de kaarten in focus te laten vastklikken (css: .stack-snap)
  kaarten.forEach((k, i) => {
    const p = document.createElement("span");
    p.className = "stack-snap";
    p.setAttribute("aria-hidden", "true");
    p.style.setProperty("--i", i);
    stapel.appendChild(p);
  });

  /* ---- Omdraaien (eigen bouw naar de Flip Card van React Bits) ----
     Elke kaart krijgt een voor- en een achterkant. De voorkant is de kaart
     zoals ze was; op de achterkant staat de volledige inhoud van dat
     onderdeel, gekopieerd uit de gewone pagina zelf, zodat ze altijd klopt met
     wat verderop staat. Na een taalwissel wordt opnieuw gekopieerd. De kaart
     behoudt haar maat; wat niet past, scrol je binnen de achterkant. */
  const ACHTER = {
    "#home": [".essentie .facts"],
    "#werk": ["#werk .cols-3"],
    "#ervaring": ["#ervaring .org > .rows"],
    "#ksa": ["#ksa > .grade > .wrap > .rows"],
    "#over": ["#over .prose", "#over .list-2"],
    "#opleiding": ["#opleiding .g-centraal .rows"],
    "#masterproef": ["#masterproef .numbers", "#masterproef .findings"],
    "#contact": ["#contact .contact-list"],
  };
  const sjabloon = (naam) => { const el = stapel.querySelector('[data-sjabloon="' + naam + '"]'); return el ? el.textContent.trim() : ""; };
  const draaiKaarten = kaarten.map((k) => {
    const voor = document.createElement("div");
    voor.className = "stack-face stack-front";
    while (k.firstChild) voor.appendChild(k.firstChild);
    const achter = document.createElement("div");
    achter.className = "stack-face stack-back";
    achter.setAttribute("aria-hidden", "true");
    const draai = document.createElement("div");
    draai.className = "stack-flip";
    draai.append(voor, achter);
    k.appendChild(draai);
    const knop = document.createElement("button");
    knop.type = "button"; knop.className = "btn btn-line stack-flipknop";
    const rij = voor.querySelector(".btn-row");
    if (rij) rij.appendChild(knop);
    return { k, voor, achter, knop };
  });
  /* ---- Eigen scrollbalk op de achterkant ----
     Een lijn met een kapsule in het accent van de kaart (css: .stack-scroll).
     De kapsule is even hoog als het zichtbare deel van de inhoud tegenover het
     geheel (minstens 32 px) en staat waar je bent. Slepen schuift mee, een
     klik op de lijn springt een scherm verder in die richting. Scrollen met
     wiel, vinger of toetsen blijft gewoon op de inhoud zelf werken. */
  const balken = [];
  const zetBalk = (b) => {
    const { inhoud, rail, duim } = b;
    const sh = inhoud.scrollHeight, ch = inhoud.clientHeight;
    rail.style.top = inhoud.offsetTop + "px";
    rail.style.height = ch + "px";
    if (sh - ch < 2) { rail.hidden = true; return; }
    rail.hidden = false;
    const th = Math.max(32, ch * ch / sh);
    b.th = th;
    duim.style.height = th.toFixed(1) + "px";
    duim.style.transform = "translateY(" + (inhoud.scrollTop / (sh - ch) * (ch - th)).toFixed(1) + "px)";
  };
  const zetBalken = () => balken.forEach(zetBalk);
  const maakBalk = (inhoud) => {
    const rail = document.createElement("div");
    rail.className = "stack-scroll";
    rail.setAttribute("aria-hidden", "true");
    const duim = document.createElement("i");
    rail.appendChild(duim);
    const b = { inhoud, rail, duim, th: 32 };
    // na een taalwissel wordt de achterkant opnieuw gemaakt: oude balken weg
    for (let j = balken.length - 1; j >= 0; j--) if (!balken[j].rail.isConnected) balken.splice(j, 1);
    balken.push(b);
    let r = null;
    inhoud.addEventListener("scroll", () => { if (r === null) r = requestAnimationFrame(() => { r = null; zetBalk(b); }); }, { passive: true });
    let start = null;
    duim.addEventListener("pointerdown", (e) => {
      e.preventDefault(); e.stopPropagation();
      duim.setPointerCapture(e.pointerId);
      start = { y: e.clientY, st: inhoud.scrollTop };
      rail.classList.add("sleept");
    });
    duim.addEventListener("pointermove", (e) => {
      if (!start) return;
      const sh = inhoud.scrollHeight, ch = inhoud.clientHeight;
      inhoud.scrollTop = start.st + (e.clientY - start.y) * (sh - ch) / Math.max(1, ch - b.th);
    });
    const los = () => { start = null; rail.classList.remove("sleept"); };
    duim.addEventListener("pointerup", los);
    duim.addEventListener("pointercancel", los);
    rail.addEventListener("click", (e) => {
      if (e.target === duim) return;
      const dr = duim.getBoundingClientRect();
      const richting = e.clientY > dr.top + dr.height / 2 ? 1 : -1;
      inhoud.scrollBy({ top: richting * inhoud.clientHeight * 0.85, behavior: rustig() ? "auto" : "smooth" });
    });
    requestAnimationFrame(() => zetBalk(b));
    return rail;
  };

  const vulAchter = () => {
    draaiKaarten.forEach(({ k, voor, achter, knop }) => {
      const meer = voor.querySelector(".stack-more");
      const doel = meer ? meer.getAttribute("href") : "";
      achter.textContent = "";
      const kop = document.createElement("div");
      kop.className = "stack-back-kop";
      const lbl = voor.querySelector(".label"), titel = voor.querySelector(".stack-title");
      if (lbl) kop.appendChild(lbl.cloneNode(true));
      if (titel) { const t = titel.cloneNode(true); t.removeAttribute("id"); kop.appendChild(t); }
      const terug = document.createElement("button");
      terug.type = "button"; terug.className = "btn btn-line stack-terug"; terug.textContent = sjabloon("terug");
      kop.appendChild(terug);
      const inhoud = document.createElement("div");
      inhoud.className = "stack-back-inhoud";
      (ACHTER[doel] || []).forEach((sel) => {
        const bron = document.querySelector(sel);
        if (!bron) return;
        const kopie = bron.cloneNode(true);
        kopie.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        kopie.querySelectorAll("[data-i18n]").forEach((el) => el.removeAttribute("data-i18n"));
        kopie.removeAttribute("data-i18n");
        inhoud.appendChild(kopie);
      });
      achter.append(kop, inhoud, maakBalk(inhoud));
      knop.textContent = sjabloon("flip");
      terug.addEventListener("click", () => zetGedraaid(k, false));
    });
  };
  const zetGedraaid = (k, op) => {
    const d = draaiKaarten.find((x) => x.k === k);
    if (!d) return;
    k.classList.toggle("gedraaid", op);
    d.achter.setAttribute("aria-hidden", op ? "false" : "true");
    d.voor.setAttribute("aria-hidden", op ? "true" : "false");
    d.achter.toggleAttribute("inert", !op);
    d.voor.toggleAttribute("inert", op);
    if (op) requestAnimationFrame(zetBalken);
  };
  draaiKaarten.forEach(({ k, knop }) => {
    knop.addEventListener("click", () => { k.classList.remove("links"); zetGedraaid(k, true); });
    zetGedraaid(k, false);
  });
  vulAchter();
  addEventListener("cv-layout", vulAchter);
  addEventListener("resize", zetBalken);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(zetBalken);

  /* ---- Draaien met een klik naast de kaart ----
     Een klik in de lege ruimte links of rechts van de kaart in beeld draait
     haar om, en een tweede klik terug. Rechts draait ze naar rechts om, links
     naar links (klasse links), zoals je een kaart aan die kant zou omslaan.
     Enkel naast de kaart, op haar hoogte, en de cursor toont dat het kan. */
  const naastKaart = (e) => {
    const k = kaarten[Math.round(huidig)];
    if (!k || e.target.closest(".stack-card")) return null;
    const r = k.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) return null;
    if (e.clientX < r.left) return { k, kant: "links" };
    if (e.clientX > r.right) return { k, kant: "rechts" };
    return null;
  };
  podium.addEventListener("click", (e) => {
    const n = naastKaart(e);
    if (!n) return;
    const op = !n.k.classList.contains("gedraaid");
    if (op) n.k.classList.toggle("links", n.kant === "links");
    zetGedraaid(n.k, op);
  });
  podium.addEventListener("mousemove", (e) => { podium.classList.toggle("kan-draaien", !!naastKaart(e)); });
  podium.addEventListener("mouseleave", () => podium.classList.remove("kan-draaien"));

  /* ---- Tekst op de voorkant: enkel hele regels ----
     Op een gsm is er onder de foto weinig plaats, en de tekst krimpt dan mee
     tot een halve regel onderaan zichtbaar bleef. Hier wordt geteld hoeveel
     volledige regels er passen, en daar kapt line-clamp af met een
     beletselteken. Enkel waar de css de tekst al afkapt (line-clamp, op smalle
     en lage schermen); opnieuw na een taalwissel en bij een andere
     schermmaat. */
  const teksten = kaarten.map((k) => k.querySelector(".stack-front .stack-text")).filter(Boolean);
  const pasTekst = () => {
    if (!aan()) return;
    teksten.forEach((t) => { t.style.removeProperty("-webkit-line-clamp"); t.hidden = false; });
    teksten.forEach((t) => {
      const cs = getComputedStyle(t);
      // Chromium meldt zo'n tekst als flow-root, dus kijken naar de afkapping zelf
      if (!cs.webkitLineClamp || cs.webkitLineClamp === "none") return;
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6;
      const n = Math.floor((t.clientHeight + 1) / lh);
      // past er geen volledige regel, dan liever geen tekst dan een halve
      if (n < 1) { t.hidden = true; return; }
      t.style.setProperty("-webkit-line-clamp", String(n));
    });
  };
  addEventListener("cv-layout", () => requestAnimationFrame(pasTekst));
  addEventListener("resize", pasTekst);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pasTekst);

  /* Het accent van elke kaart, voor de kleur van de voortgangsbalk. Opnieuw
     gelezen na een wissel tussen licht en donker, want dan verandert elk palet. */
  let accenten = [];
  const leesAccenten = () => { accenten = kaarten.map((k) => getComputedStyle(k).getPropertyValue("--g-acc").trim()); };
  leesAccenten();
  new MutationObserver(() => { leesAccenten(); if (aan()) teken(); }).observe(wortel, { attributes: true, attributeFilter: ["data-mode"] });

  let huidig = 0, raf = null;
  /* Het podium kleeft onder de menubalk (top: 60px in de css), dus de stapel
     begint te bewegen zodra haar bovenrand die lijn haalt, niet de bovenrand
     van het scherm. Eerder werd vanaf 0 gerekend: alles liep 60 px achter en
     de laatste kaart was enkel volledig te bereiken dankzij de footer eronder. */
  const plak = () => parseFloat(getComputedStyle(podium).top) || 0;
  const doelStand = () => {
    const r = stapel.getBoundingClientRect();
    const loop = stapel.offsetHeight - podium.offsetHeight;
    return loop > 0 ? clamp((plak() - r.top) / loop, 0, 1) * (n - 1) : 0;
  };
  const teken = () => {
    const h = podium.clientHeight;
    kaarten.forEach((k, i) => {
      const rel = huidig - i;
      let t, f = "none", z = i, zicht = true;
      if (rel < 0) {
        // nog te komen: schuift van onderen in beeld
        zicht = rel > -1.02;
        t = "translate3d(0," + (-rel * h).toFixed(1) + "px,0)";
      } else {
        zicht = rel <= S.depth + 1;
        const d = Math.min(rel, S.depth);
        t = "translate3d(0," + (-d * S.peek).toFixed(1) + "px,0) scale(" + (1 - d * S.scaleStep).toFixed(4) + ")";
        if (rel > 0.4 && k.classList.contains("gedraaid")) zetGedraaid(k, false);
        const diep = Math.min(rel, 1);
        const vaag = rustig() ? 0 : S.blur * diep;
        // de bovenste kaart krijgt geen filter: een filter maakt de 3D-draai plat
        f = rel < 0.02 ? "none" : "brightness(" + (1 - S.dim * Math.min(rel, 1.6)).toFixed(3) + ")" + (vaag > 0.2 ? " blur(" + vaag.toFixed(2) + "px)" : "");
      }
      k.style.visibility = zicht ? "visible" : "hidden";
      k.style.transform = t;
      k.style.filter = f;
      k.style.zIndex = z;
      k.toggleAttribute("inert", Math.round(huidig) !== i);
    });
    if (balk) {
      balk.style.transform = "scaleX(" + (n > 1 ? huidig / (n - 1) : 1).toFixed(4) + ")";
      // de kleur schuift mee: tussen twee kaarten een menging van hun accenten
      const i = Math.floor(huidig), f = huidig - i;
      const a = accenten[clamp(i, 0, n - 1)], z = accenten[clamp(i + 1, 0, n - 1)];
      if (a && z) balk.style.background = f < 0.002 || a === z ? a : "color-mix(in oklab, " + a + " " + ((1 - f) * 100).toFixed(1) + "%, " + z + ")";
    }
    if (teller) teller.textContent = (Math.round(huidig) + 1) + " / " + n;
    /* Op weg naar de laatste kaart maken balk en teller plaats voor de footer:
       ze vloeien in elkaar over op dezelfde plek, mee met het scrollen. */
    if (ui && voet) {
      const e = clamp((huidig - (n - 1.6)) / 0.6, 0, 1);
      ui.style.opacity = (1 - e).toFixed(3);
      voet.style.opacity = e.toFixed(3);
      voet.style.transform = "translate(-50%, " + ((1 - e) * 6).toFixed(1) + "px)";
    }
  };
  const stap = () => {
    raf = null;
    if (!aan()) return;
    const doel = doelStand();
    const factor = rustig() ? 1 : 1 - Math.pow(S.smooth, 0.35);
    huidig += (doel - huidig) * factor;
    if (Math.abs(doel - huidig) < 0.0015) huidig = doel;
    teken();
    if (huidig !== doel) raf = requestAnimationFrame(stap);
  };
  const plan = () => { if (raf === null && aan()) raf = requestAnimationFrame(stap); };
  addEventListener("scroll", plan, { passive: true });
  addEventListener("resize", plan);

  const zet = (op, bewaar) => {
    if (op) wortel.dataset.view = "compact";
    else delete wortel.dataset.view;
    if (knop) knop.checked = op;
    if (bewaar) { try { localStorage.setItem("cv-weergave", op ? "compact" : "normaal"); } catch (e) {} }
    if (op) { huidig = doelStand(); teken(); requestAnimationFrame(pasTekst); }
    // vastklikken pas na een beeld, op de stand waar je nu staat (css: .klikt)
    wortel.classList.remove("klikt");
    if (op) requestAnimationFrame(() => requestAnimationFrame(() => { if (aan()) wortel.classList.add("klikt"); }));
  };
  if (knop) knop.addEventListener("change", () => { zet(knop.checked, true); scrollTo(0, 0); });
  zet(aan(), false);

  /* "Lees verder": terug naar de gewone weergave en naar het onderdeel. De
     keuze wordt mee bijgewerkt, anders kom je bij het volgende bezoek weer in
     de compacte weergave terwijl je die net verliet. */
  const naarSectie = (hash) => {
    zet(false, true);
    requestAnimationFrame(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      history.replaceState(null, "", hash);
    });
  };
  stapel.addEventListener("click", (e) => {
    const a = e.target.closest(".stack-more");
    if (!a) return;
    e.preventDefault();
    naarSectie(a.getAttribute("href"));
  });

  /* In de compacte weergave springen de menu-items naar de juiste kaart in de
     stapel in plaats van naar een verborgen sectie. */
  const doelen = kaarten.map((k) => { const a = k.querySelector(".stack-more"); return a ? a.getAttribute("href") : ""; });
  document.querySelectorAll('.nav-links a[href^="#"], .brand').forEach((a) => {
    a.addEventListener("click", (e) => {
      if (!aan()) return;
      const i = doelen.indexOf(a.getAttribute("href"));
      if (i < 0) return;
      e.preventDefault();
      const loop = stapel.offsetHeight - podium.offsetHeight;
      const top = stapel.getBoundingClientRect().top + scrollY - plak() + (n > 1 ? loop * i / (n - 1) : 0);
      scrollTo({ top, behavior: rustig() ? "auto" : "smooth" });
    }, true);
  });
})();
