/* Lint onder Contact: "Laten we samenwerken" op een golvende band in het
   accent van Contact, die traag over de volle breedte loopt (eigen bouw naar
   de TextLoop van React Bits, variant "Lint" uit de voorstellen). Tekst langs
   een pad in svg; de band is een dikke lijn langs hetzelfde pad. De kleuren
   komen uit de css (--g-acc, --g-bg), dus licht en donker volgen vanzelf.

   Het lint is één link naar de mail; de herhaling in de svg is enkel decor
   (aria-hidden), schermlezers lezen de verborgen tekst in .lint-txt. Die tekst
   wordt ook vertaald, en na een taalwissel (cv-layout) bouwt het lint opnieuw.

   Te slepen (het lint volgt de vinger en loopt na het loslaten met die vaart
   verder, tot het terug op zijn eigen tempo zit); staat stil zolang de muis
   erop rust. Na het slepen opent een klik geen mail. Bij minder beweging staat
   het stil (wel te slepen). Het rekent enkel als het in beeld is. */
(() => {
  const host = document.querySelector(".lint");
  if (!host) return;
  const NS = "http://www.w3.org/2000/svg";
  const txtEl = host.querySelector(".lint-txt");
  const wortel = document.documentElement;
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const rustig = () => mq.matches || wortel.dataset.motion === "reduce";
  const mk = (tag, at = {}) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); return e; };

  const SNELHEID = 38; // px per seconde langs het pad
  const svg = mk("svg", { class: "lint-svg", "aria-hidden": "true", focusable: "false" });
  host.appendChild(svg);


  // Een golf als reeks korte lijnstukjes, wat ruimer dan het scherm zodat
  // de band aan beide kanten buiten beeld begint.
  const golf = (W, midden, amp, lambda) => {
    let d = "";
    for (let x = -220; x <= W + 220; x += 4) {
      const y = midden + amp * Math.sin((2 * Math.PI * x) / lambda);
      d += (d ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(2);
    }
    return d;
  };

  let W = 0, tekst = "", tp = null, L = 1, off = 0, v = SNELHEID;
  const bouw = (forceer) => {
    const w = host.clientWidth, t = (txtEl.textContent || "").trim().toUpperCase();
    if (!w || (!forceer && w === W && t === tekst)) return;
    W = w; tekst = t;
    const s = W < 700 ? 0.68 : W < 1000 ? 0.84 : 1;
    const amp = 30 * s, dikte = 64 * s, H = Math.round(dikte + amp * 2 + 24);
    svg.replaceChildren();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("height", H);
    const d = golf(W, H / 2, amp, Math.max(380, W * 0.62));
    const pad = mk("path", { id: "lint-pad", d, fill: "none" });
    const band = mk("path", { class: "lint-band", d, fill: "none", "stroke-width": dikte });
    const tx = mk("text", { class: "lint-tekst", "font-size": 44 * s, "letter-spacing": 0.6, dy: "0.36em" });
    tp = mk("textPath", { href: "#lint-pad" });
    tx.appendChild(tp);
    svg.append(pad, band, tx);
    const eenheid = () => {
      const f = document.createDocumentFragment();
      const a = mk("tspan"); a.textContent = tekst; f.appendChild(a);
      const b = mk("tspan", { class: "lint-sep" }); b.textContent = " ✦ "; f.appendChild(b);
      return f;
    };
    // eerst vier eenheden om te meten, daarna genoeg om het pad te vullen
    for (let k = 0; k < 4; k++) tp.appendChild(eenheid());
    L = tx.getComputedTextLength() / 4 || 1;
    const n = Math.ceil(pad.getTotalLength() / L) + 2;
    for (let k = 4; k < n; k++) tp.appendChild(eenheid());
    zet();
  };
  const zet = () => {
    if (!tp) return;
    const o = ((off % L) + L) % L;
    tp.setAttribute("startOffset", (o - L).toFixed(2));
  };

  // slepen
  let zweeft = false, sleept = false, versleept = 0, lx = 0, lt = 0, sv = 0;
  host.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") zweeft = true; });
  host.addEventListener("pointerleave", () => { zweeft = false; });
  host.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    sleept = true; versleept = 0; lx = e.clientX; lt = performance.now(); sv = 0;
  });
  addEventListener("pointermove", (e) => {
    if (!sleept) return;
    const nu = performance.now(), dx = e.clientX - lx, dt = Math.max(1, nu - lt);
    versleept += Math.abs(dx);
    if (versleept > 4 && !host.hasPointerCapture?.(e.pointerId)) { try { host.setPointerCapture(e.pointerId); } catch (_) {} }
    off += dx; sv = (dx / dt) * 1000; lx = e.clientX; lt = nu;
    zet(); start();
  });
  const los = () => { if (!sleept) return; sleept = false; if (versleept > 4) v = Math.max(-1600, Math.min(1600, sv)); };
  addEventListener("pointerup", los);
  addEventListener("pointercancel", los);
  // na een sleepbeweging geen mail
  host.addEventListener("click", (e) => { if (versleept > 4) { e.preventDefault(); versleept = 0; } });
  host.addEventListener("dragstart", (e) => e.preventDefault());

  // de lus loopt enkel als het lint in beeld is
  let inBeeld = false, raf = 0, vorige = 0;
  const stap = (nu) => {
    const dt = Math.min(0.05, (nu - vorige) / 1000); vorige = nu;
    if (!sleept) {
      const doel = zweeft || rustig() ? 0 : SNELHEID;
      v += (doel - v) * Math.min(1, dt * (zweeft ? 7 : 2.2));
      off += v * dt;
      zet();
    }
    const stil = !sleept && Math.abs(v) < 0.5 && (zweeft || rustig());
    raf = inBeeld && !stil ? requestAnimationFrame(stap) : 0;
  };
  const start = () => { if (!raf && inBeeld) { vorige = performance.now(); raf = requestAnimationFrame(stap); } };
  new IntersectionObserver((r) => { inBeeld = r[0].isIntersecting; if (inBeeld) start(); }, { rootMargin: "80px 0px" }).observe(host);
  host.addEventListener("pointerleave", start);
  mq.addEventListener?.("change", start);
  new MutationObserver(start).observe(wortel, { attributes: true, attributeFilter: ["data-motion"] });

  new ResizeObserver(() => bouw()).observe(host);
  addEventListener("cv-layout", () => bouw());
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => bouw(true));
})();
