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
  let klaarMelden;
  window.__velWeg = new Promise((r) => { klaarMelden = r; });

  const rustig = matchMedia("(prefers-reduced-motion: reduce)").matches || wortel.dataset.motion === "reduce";
  // geen vel bij een herbezoek in dezelfde sessie, in de compacte weergave of bij minder beweging
  if (!vel || !wortel.classList.contains("intro") || rustig || wortel.dataset.view === "compact") {
    if (vel) vel.remove();
    if (waas) waas.remove();
    klaarMelden();
    return;
  }

  const regel = vel.querySelector(".vel-regel");
  const hint = vel.querySelector(".vel-hint");
  wortel.classList.add("vel-open");
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
  const wagen = document.createElement("span");
  wagen.className = "vel-wagen"; wagen.setAttribute("aria-hidden", "true");
  regel.appendChild(wagen);

  const typ = () => {
    let t = 350;
    letters.forEach((l, i) => {
      const c = TEKST[i];
      t += c === " " ? rnd(70, 110) : rnd(65, 150);
      if (c === "-") t += 160;               // even nadenken voor het streepje
      setTimeout(() => {
        l.classList.add("aan");
        if (c !== " ") { vel.classList.remove("schok"); void vel.offsetWidth; vel.classList.add("schok"); }
      }, t);
    });
    setTimeout(() => hint.classList.add("toon"), t + 500);
  };
  const lt = document.fonts && document.fonts.load ? document.fonts.load('1em "Special Elite"').catch(() => {}) : Promise.resolve();
  Promise.race([lt, new Promise((r) => setTimeout(r, 1200))]).then(typ);
  // de focus op het vel zelf, zonder kader: zo hoort een schermlezer het
  // venster, en werken Enter en spatie meteen
  vel.tabIndex = -1;
  vel.focus({ preventScroll: true });

  /* ---- omhoog vegen ---- */
  let p = 0, anim = null, weg = false;
  const zetP = (v) => {
    p = v;
    vel.style.transform = v ? "translate3d(0," + (-v * 105).toFixed(2) + "%,0)" : "";
    wortel.style.setProperty("--vp", Math.max(0, Math.min(1, v)).toFixed(4));
  };
  const naar = (doel, duur, klaar) => {
    cancelAnimationFrame(anim);
    const van = p, t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const stap = (nu) => {
      const t = Math.min(1, (nu - t0) / duur);
      zetP(van + (doel - van) * ease(t));
      if (t < 1) anim = requestAnimationFrame(stap);
      else if (klaar) klaar();
    };
    anim = requestAnimationFrame(stap);
  };
  const opruimen = () => {
    vel.remove();
    if (waas) waas.remove();
    wortel.classList.remove("vel-open");
    wortel.style.removeProperty("--vp");
    klaarMelden();
  };
  const opzij = () => {
    if (weg) return;
    weg = true;
    naar(1, 1100, opruimen);
  };

  let y0 = 0, dy = 0, t0 = 0, sleept = false;
  vel.addEventListener("pointerdown", (e) => {
    if (weg || e.target.closest(".vel-hint")) return;
    cancelAnimationFrame(anim);
    sleept = true; y0 = e.clientY; dy = 0; t0 = performance.now();
    vel.setPointerCapture(e.pointerId);
  });
  vel.addEventListener("pointermove", (e) => {
    if (!sleept) return;
    dy = e.clientY - y0;
    // naar boven volgt het vel de vinger; naar beneden geeft het weerstand
    zetP(dy < 0 ? -dy / innerHeight : -dy * 0.18 / innerHeight);
  });
  const los = () => {
    if (!sleept) return;
    sleept = false;
    const snel = dy / Math.max(1, performance.now() - t0);
    if (dy < -innerHeight * 0.22 || snel < -0.6) opzij();
    else naar(0, 450);
  };
  vel.addEventListener("pointerup", los);
  vel.addEventListener("pointercancel", los);
  hint.addEventListener("click", opzij);
  addEventListener("wheel", (e) => { if (!weg && e.deltaY > 12) opzij(); }, { passive: true });
  addEventListener("keydown", (e) => {
    if (weg) return;
    if (["Enter", " ", "ArrowUp", "ArrowDown", "PageDown", "Escape", "Tab"].includes(e.key)) {
      if (e.key !== "Tab") e.preventDefault();
      opzij();
    }
  });
  zetP(0);
})();
