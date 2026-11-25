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
      achter.append(kop, inhoud);
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
  };
  draaiKaarten.forEach(({ k, knop }) => {
    knop.addEventListener("click", () => zetGedraaid(k, true));
    zetGedraaid(k, false);
  });
  vulAchter();
  addEventListener("cv-layout", vulAchter);

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
  const doelStand = () => {
    const r = stapel.getBoundingClientRect();
    const loop = stapel.offsetHeight - podium.offsetHeight;
    return loop > 0 ? clamp(-r.top / loop, 0, 1) * (n - 1) : 0;
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
      const top = stapel.getBoundingClientRect().top + scrollY + (n > 1 ? loop * i / (n - 1) : 0);
      scrollTo({ top, behavior: rustig() ? "auto" : "smooth" });
    }, true);
  });
})();
