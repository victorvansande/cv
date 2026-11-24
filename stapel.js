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
        const diep = Math.min(rel, 1);
        const vaag = rustig() ? 0 : S.blur * diep;
        f = "brightness(" + (1 - S.dim * Math.min(rel, 1.6)).toFixed(3) + ")" + (vaag > 0.2 ? " blur(" + vaag.toFixed(2) + "px)" : "");
      }
      k.style.visibility = zicht ? "visible" : "hidden";
      k.style.transform = t;
      k.style.filter = f;
      k.style.zIndex = z;
      k.toggleAttribute("inert", Math.round(huidig) !== i);
    });
    if (balk) balk.style.transform = "scaleX(" + (n > 1 ? huidig / (n - 1) : 1).toFixed(4) + ")";
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
    if (op) { huidig = doelStand(); teken(); }
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
