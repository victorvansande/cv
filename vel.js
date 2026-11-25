/* ============================================================
   Victor Van Sande - CV website  ·  het vel papier
   ------------------------------------------------------------
   Bij het eerste bezoek in een sessie ligt er een vel papier over de site.
   Een typemachine typt er "Victor Van Sande - CV" op, met inkt: elke aanslag
   staat net anders, en een svg-filter laat de randen rafelen en hier en daar
   wat inkt wegvallen. Het vel veeg je omhoog weg, zoals het vergrendelscherm
   van Windows. Terwijl het wegschuift, stelt de site eronder scherp.

   Eén waarde p (0 = vel dicht, 1 = vel weg) stuurt alles: de plaats van het
   vel en de vervaging van de laag eronder (--vp). Die laag vervaagt met
   backdrop-filter enkel wat op het scherm staat; de hele pagina vervagen zou
   op oudere toestellen haperen.

   Dit script laadt voor main.js en zet window.__velWeg: een belofte die
   afgaat zodra het vel weg is (of meteen, als er geen vel is). De intro in
   main.js wacht daarop, zodat ze pas begint wanneer je de site ziet.
   ============================================================ */
(() => {
  "use strict";

  const TEKST = "Victor Van Sande - CV";
  const wortel = document.documentElement;
  const vel = document.getElementById("vel");
  const waas = document.querySelector(".vel-waas");
  let klaarMelden, bijnaMelden;
  window.__velWeg = new Promise((r) => { klaarMelden = r; });
  /* __velBijna gaat af zodra het vel voor de helft weg is (en vast weggaat):
     dan start de intro al, zodat het vel en de naam in één beweging
     overlopen in plaats van na elkaar. */
  window.__velBijna = new Promise((r) => { bijnaMelden = r; });

  const rustig = matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
  // geen vel bij een herbezoek in dezelfde sessie, in de compacte weergave of bij minder beweging
  // het inlinescript in de head zet vel-open al voor de eerste paint (zo zie je
  // de site niet eerst even); hier wordt dat enkel nog bevestigd of ingetrokken
  if (!vel || !wortel.classList.contains("intro") || !wortel.classList.contains("vel-open") || rustig || wortel.dataset.view === "compact") {
    wortel.classList.remove("vel-open");
    if (vel) vel.remove();
    if (waas) waas.remove();
    klaarMelden(); bijnaMelden();
    return;
  }
  /* Zolang het vel er ligt, staat de scrollbalk uit (zie style.css). Zonder
     compensatie schoof de site een halve balkbreedte op zodra het vel weg was,
     midden in de intro. De body krijgt daarom zolang rechts de breedte van een
     scrollbalk als opvulling, zodat de inhoud even breed is als erna. Op
     toestellen met zwevende scrollbalken (gsm, Mac) is dat 0. */
  const proef = document.createElement("div");
  proef.style.cssText = "position:absolute;top:-999px;width:100px;height:50px;overflow:scroll;visibility:hidden";
  document.body.appendChild(proef);
  wortel.style.setProperty("--sbw", (proef.offsetWidth - proef.clientWidth) + "px");
  proef.remove();

  const regel = vel.querySelector(".vel-regel");

  /* ---- licht of donker kiezen ----
     Het vel volgt meteen mee, en de keuze geldt voor de hele site (dezelfde
     opslag en dezelfde meta theme-color als de knop in de menubalk). */
  const opties = [...vel.querySelectorAll(".vel-optie")];
  const themaKleur = document.querySelector('meta[name="theme-color"]');
  const toonKeuze = () => {
    const licht = wortel.dataset.mode === "light";
    opties.forEach((o) => o.setAttribute("aria-pressed", String((o.dataset.modus === "light") === licht)));
  };
  opties.forEach((o) => o.addEventListener("click", () => {
    const licht = o.dataset.modus === "light";
    if (licht) wortel.dataset.mode = "light"; else wortel.removeAttribute("data-mode");
    if (themaKleur) themaKleur.content = licht ? "#f6f1ea" : "#0c0a0a";
    try { localStorage.setItem("cv-modus", licht ? "light" : "dark"); } catch (e) {}
    toonKeuze();
    // met de muis gekozen: de focus terug naar het vel, zodat Enter het meteen wegveegt
    if (window.event && window.event.detail > 0) vel.focus({ preventScroll: true });
    // de knop in de menubalk en de overgangen tussen secties volgen via data-mode
    window.dispatchEvent(new Event("cv-layout"));
  }));
  toonKeuze();
  const hint = vel.querySelector(".vel-hint");
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---- typen ---- */
  const letters = [...TEKST].map((c) => {
    const s = document.createElement("span");
    s.className = "vel-letter";
    s.textContent = c;
    s.style.setProperty("--t", "translateY(" + rnd(-.035, .045).toFixed(3) + "em) rotate(" + rnd(-2.6, 2.6).toFixed(2) + "deg)");
    s.style.setProperty("--o", rnd(.84, 1).toFixed(2));
    regel.appendChild(s);
    return s;
  });
  /* De cursor staat telkens net achter de laatst getypte letter. Alle letters
     staan er van bij het begin (onzichtbaar), dus de regel heeft meteen zijn
     eindbreedte; de cursor schuift ertussen. Omdat de cursor altijd even breed
     is, staat elke letter links ervan al op zijn uiteindelijke plaats. */
  const wagen = document.createElement("span");
  wagen.className = "vel-wagen"; wagen.setAttribute("aria-hidden", "true");
  regel.insertBefore(wagen, letters[0]);

  /* Elke aanslag wordt pas gepland nadat de vorige gevallen is. Als de pagina
     eronder even bezig is, wordt het zo een korte pauze, zoals bij echt typen,
     in plaats van een paar letters die tegelijk verschijnen. */
  let schok = false;
  const typ = () => {
    let i = 0;
    const volgende = () => {
      if (weg) return;
      if (i >= letters.length) { setTimeout(() => hint.classList.add("toon"), 500); return; }
      const c = TEKST[i], l = letters[i];
      l.classList.add("aan");
      regel.insertBefore(wagen, letters[i + 1] || null);
      if (c !== " ") {
        schok = !schok;
        // enkel de getypte regel schokt mee, niet het hele vel: anders trilden
        // de keuze voor licht/donker en het pijltje bij elke letter mee
        regel.classList.remove(schok ? "schok-b" : "schok-a");
        regel.classList.add(schok ? "schok-a" : "schok-b");
      }
      i++;
      const n = TEKST[i];
      let d = n === " " ? rnd(70, 110) : rnd(65, 150);
      if (n === "-") d += 160;               // even nadenken voor het streepje
      setTimeout(volgende, d);
    };
    setTimeout(volgende, 350 + rnd(65, 150));
  };
  /* Beginnen zodra het lettertype er is en de pagina eronder klaar is met
     laden: in die eerste fractie bouwt main.js de site op, en dat gaf
     haperingen in de eerste letters. Hoogstens 1,6 seconde wachten. */
  const lt = document.fonts && document.fonts.load ? document.fonts.load('1em "Special Elite"').catch(() => {}) : Promise.resolve();
  const geladen = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
  Promise.race([Promise.all([lt, geladen]), new Promise((r) => setTimeout(r, 1600))])
    .then(() => new Promise((r) => requestAnimationFrame(() => r())))
    .then(typ);
  // de focus op het vel zelf, zonder kader: zo hoort een schermlezer het
  // venster, en werken Enter en spatie meteen
  vel.tabIndex = -1;
  vel.focus({ preventScroll: true });

  /* ---- omhoog vegen ---- */
  /* Bij het wegvegen wordt het vel opgetild: het schuift omhoog, de onderrand
     kantelt licht naar je toe en de schaduw eronder groeit. De site eronder
     stelt scherp en zakt van net iets dichterbij op zijn plaats. */
  let p = 0, anim = null, weg = false;
  const zetP = (v) => {
    p = v;
    const op = Math.max(0, Math.min(1, v));
    vel.style.transform = v
      ? "translate3d(0," + (-v * 108).toFixed(2) + "%,0) perspective(1600px) rotateX(" + (op * 9).toFixed(2) + "deg) scale(" + (1 - op * 0.035).toFixed(4) + ")"
      : "";
    wortel.style.setProperty("--vp", op.toFixed(4));
    if (weg && op >= 0.5) bijnaMelden();
    // de waas eronder staat enkel aan terwijl het vel beweegt (zie style.css)
    wortel.classList.toggle("vel-los", v !== 0);
  };
  const naar = (doel, duur, klaar, ease) => {
    cancelAnimationFrame(anim);
    const van = p, t0 = performance.now();
    ease = ease || ((t) => 1 - Math.pow(1 - t, 3));
    const stap = (nu) => {
      const t = Math.min(1, (nu - t0) / duur);
      zetP(van + (doel - van) * ease(t, van));
      if (t < 1) anim = requestAnimationFrame(stap);
      else if (klaar) klaar();
    };
    anim = requestAnimationFrame(stap);
  };
  /* Wegvegen met toetsen, scrollen of de knop: in één vloeiende beweging, die
     vlot vertrekt en zacht uitloopt. */
  const wegEase = (t) => 1 - Math.pow(1 - t, 3.2);
  const opruimen = () => {
    vel.remove();
    if (waas) waas.remove();
    wortel.classList.remove("vel-open", "vel-los");
    wortel.style.removeProperty("--vp");
    wortel.style.removeProperty("--sbw");
    bijnaMelden(); klaarMelden();
  };
  const opzij = (vaart) => {
    if (weg) return;
    weg = true;
    hint.classList.remove("toon");
    /* Na een veeg gaat het vel verder met de snelheid van je vinger: de duur
       volgt uit de afstand die nog rest en hoe snel je losliet, zodat het vel
       niet afremt of versnelt op het moment dat je loslaat. */
    if (vaart && vaart > 0) {
      const rest = 1 - p;
      const duur = Math.max(220, Math.min(900, 1.6 * rest / vaart * 1000));
      naar(1, duur, opruimen, (t) => 1 - Math.pow(1 - t, 1.6));
    } else naar(1, 820, opruimen, wegEase);
  };

  /* Slepen: het vel volgt je vinger meteen, één keer per beeld. De snelheid
     wordt gemeten over de laatste ~80 ms, zodat een snelle veeg op het einde
     telt, ook na een trage aanzet. */
  let y0 = 0, dy = 0, sleept = false, raf = 0, punten = [];
  const teken = () => { raf = 0; zetP(dy < 0 ? -dy / innerHeight : -dy * 0.18 / innerHeight); };
  vel.addEventListener("pointerdown", (e) => {
    if (weg || e.target.closest(".vel-hint, .vel-keuze")) return;
    cancelAnimationFrame(anim);
    sleept = true; y0 = e.clientY - (p > 0 ? -p * innerHeight : 0); dy = e.clientY - y0; punten = [[performance.now(), e.clientY]];
    vel.setPointerCapture(e.pointerId);
  });
  vel.addEventListener("pointermove", (e) => {
    if (!sleept) return;
    dy = e.clientY - y0;
    const nu = performance.now();
    punten.push([nu, e.clientY]);
    while (punten.length > 2 && nu - punten[0][0] > 80) punten.shift();
    if (!raf) raf = requestAnimationFrame(teken);
  });
  const los = () => {
    if (!sleept) return;
    sleept = false;
    cancelAnimationFrame(raf); raf = 0; teken();
    const a = punten[0], b = punten[punten.length - 1];
    const vy = b && a && b[0] > a[0] ? (b[1] - a[1]) / (b[0] - a[0]) : 0;   // px per ms, negatief = omhoog
    const vaart = -vy * 1000 / innerHeight;                                // fractie van het scherm per seconde
    if (dy < -innerHeight * 0.18 || vaart > 0.9) opzij(Math.max(vaart, 1.2));
    else naar(0, 420);
  };
  vel.addEventListener("pointerup", los);
  vel.addEventListener("pointercancel", los);
  hint.addEventListener("click", () => opzij());
  addEventListener("wheel", (e) => { if (!weg && e.deltaY > 12) opzij(); }, { passive: true });
  addEventListener("keydown", (e) => {
    if (weg) return;
    // Enter en spatie op een themaknop kiezen het thema, en vegen het vel niet weg
    if (e.target.closest && e.target.closest(".vel-keuze") && (e.key === "Enter" || e.key === " ")) return;
    if (["Enter", " ", "ArrowUp", "ArrowDown", "PageDown", "Escape"].includes(e.key)) {
      e.preventDefault();
      opzij();
    }
  });
  // met Tab ga je eerst langs de themaknoppen; wie verder tabt, verlaat het vel
  document.addEventListener("focusin", (e) => { if (!weg && !vel.contains(e.target)) opzij(); });
  zetP(0);
})();
