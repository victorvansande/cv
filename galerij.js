/* ============================================================
   Victor Van Sande - CV website  ·  galerijen
   ------------------------------------------------------------
   Twee weergaven die de gewone rasters vervangen zodra javascript loopt.
   Zonder script blijven de rasters gewoon staan, met dezelfde knoppen.

   - Fotografie: een lenticulaire carrousel. Beweeg je over een kaart, dan
     draait die strook per strook om, zoals een lenticulaire kaart, en
     verschijnt op de achterkant de titel en het bijschrift.
   - Werk: een draaiende ring van kaarten die bij het draaien vervaagt en op
     het volgende stuk vastklikt.

   Eigen bouw, geïnspireerd op de Lenticular Carousel en de Momentum Ring van
   React Bits Pro; er is geen code van overgenomen. De standaardwaarden van
   die componenten staan hieronder als constanten.

   De knoppen in de kaarten blijven de echte knoppen: een klik op de kaart in
   het midden opent de lichtbak of het voorproefvenster zoals voorheen. Een
   klik op een kaart opzij brengt die eerst naar het midden. Dat wordt in de
   capture-fase op de wikkel afgehandeld, nog voor de knop zelf de klik krijgt.
   ============================================================ */
(() => {
  "use strict";
  /* Scrollen met het muiswiel in een carrousel (Victors vraag): zolang de muis
     erin staat, draait het wiel de carrousel in plaats van de pagina. Eén stap
     per klik van het wiel; een trackpad geeft veel kleine stapjes, die tellen
     samen tot er genoeg is voor één stap. Een korte pauze na elke stap, anders
     raast één veeg door de hele reeks. */
  const wielStappen = (stap) => {
    let som = 0, rust = 0;
    return (e) => {
      if (e.ctrlKey) return; // inzoomen met ctrl + wiel blijft werken
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      const nu = performance.now();
      if (nu < rust) return;
      som += d;
      if (Math.abs(som) >= 40) { stap(som > 0 ? 1 : -1); som = 0; rust = nu + 260; }
    };
  };

  const rustig = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const glad = (t) => t * t * (3 - 2 * t);
  const tekst = (item, sel) => { const el = item.querySelector(sel); return el ? el.textContent.trim() : ""; };
  const knop = (cls, label, pad) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = cls; b.setAttribute("aria-label", label);
    b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + pad + '"/></svg>';
    return b;
  };
  const isEn = () => document.documentElement.lang === "en";

  /* ---------------------------------------------------------------
     Lenticulaire carrousel
     --------------------------------------------------------------- */
  const L = {
    gap: 26, strips: 56, sweep: 0.6, refraction: 0.32, ridge: 0.5,
    foil: 0.5, foilScale: 8, scrim: 0.85, tilt: 14, travel: 0.64, lift: 40,
    inactiveScale: 0.9, inactiveDim: 0.55, speed: 1, start: 2,
  };

  function lenticulair(gal) {
    const items = [...gal.querySelectorAll(":scope > .design-item")];
    if (items.length < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const geenHover = matchMedia("(hover: none)").matches;

    gal.classList.add("is-lenti");
    const view = document.createElement("div");
    view.className = "lenti-view";
    view.tabIndex = 0;
    view.setAttribute("role", "group");
    view.setAttribute("aria-roledescription", isEn() ? "carousel" : "carrousel");
    const track = document.createElement("div");
    track.className = "lenti-track";
    items.forEach((it) => track.appendChild(it));
    view.appendChild(track);
    const ui = document.createElement("div");
    ui.className = "gal-ui";
    const vorige = knop("gal-btn", isEn() ? "Previous" : "Vorige", "M15 18l-6-6 6-6");
    const volgende = knop("gal-btn", isEn() ? "Next" : "Volgende", "M9 18l6-6-6-6");
    const rail = document.createElement("div");
    rail.className = "gal-rail";
    const segmenten = items.map((_, i) => {
      const s = document.createElement("button");
      s.type = "button"; s.className = "gal-seg";
      s.setAttribute("aria-label", (isEn() ? "Photo " : "Foto ") + (i + 1));
      s.addEventListener("click", () => naar(i));
      rail.appendChild(s);
      return s;
    });
    // op een smal scherm vervangt een teller ("3 / 23") het spoor met streepjes:
    // bij veel foto's worden die streepjes daar te smal om te raken (zie style.css)
    const teller = document.createElement("span");
    teller.className = "gal-count";
    teller.setAttribute("aria-live", "polite");
    ui.append(vorige, rail, teller, volgende);
    gal.append(view, ui);

    const kaarten = items.map((it) => {
      const btn = it.querySelector(".diploma-thumb");
      const img = btn.querySelector("img");
      const cv = document.createElement("canvas");
      cv.className = "lenti-cv";
      cv.setAttribute("aria-hidden", "true");
      btn.appendChild(cv);
      return { it, btn, img, cv, ctx: cv.getContext("2d"), p: 0, doel: 0, rx: 0, klaar: false, voor: null, achter: null, folie: null };
    });

    let idx = Math.min(L.start, items.length - 1);
    let kw = 260, kh = 347, dx = 0;

    const cover = (ctx, img, w, h, zoom) => {
      const r = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (zoom || 1);
      const iw = img.naturalWidth * r, ih = img.naturalHeight * r;
      ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    };

    /* De twee kanten en de folie worden één keer per maat getekend; per frame
       worden er enkel stroken uit geknipt. */
    const bereid = (k) => {
      if (!k.img.complete || !k.img.naturalWidth) return;
      const W = Math.round(kw * dpr), H = Math.round(kh * dpr);
      k.cv.width = W; k.cv.height = H;
      const maak = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
      k.voor = maak(); cover(k.voor.getContext("2d"), k.img, W, H, 1);
      k.achter = maak();
      const a = k.achter.getContext("2d");
      cover(a, k.img, W, H, 1.08);
      const g = a.createLinearGradient(0, H, 0, H * 0.42);
      g.addColorStop(0, "rgba(0,0,0," + L.scrim + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      a.fillStyle = g; a.fillRect(0, 0, W, H);
      const pad = W * 0.08;
      const titel = tekst(k.it, ".design-cap-t"), sub = tekst(k.it, ".design-cap-s");
      a.fillStyle = "#ffffff";
      a.textBaseline = "alphabetic";
      a.font = "700 " + Math.round(W * 0.095) + 'px "Big Shoulders Display", "Arial Narrow", sans-serif';
      const regels = (ctx, t, max) => {
        const woorden = t.split(" "), uit = []; let r = "";
        woorden.forEach((w) => { const p = r ? r + " " + w : w; if (ctx.measureText(p).width > max && r) { uit.push(r); r = w; } else r = p; });
        if (r) uit.push(r); return uit;
      };
      a.font = "400 " + Math.round(W * 0.05) + 'px "Libre Franklin", system-ui, sans-serif';
      const subR = regels(a, sub, W - 2 * pad).slice(0, 2);
      let y = H - pad - (subR.length - 1) * W * 0.065;
      a.globalAlpha = 0.82;
      subR.forEach((r, i) => a.fillText(r, pad, y + i * W * 0.065));
      a.globalAlpha = 1;
      a.font = "700 " + Math.round(W * 0.095) + 'px "Big Shoulders Display", "Arial Narrow", sans-serif';
      const tR = regels(a, titel.toUpperCase(), W - 2 * pad).slice(0, 2);
      y -= W * 0.085 + (tR.length - 1) * W * 0.1;
      tR.forEach((r, i) => a.fillText(r, pad, y + i * W * 0.1));
      // holografische folie: dunne banden onder een hoek, over twee kaartbreedtes
      k.folie = document.createElement("canvas");
      k.folie.width = W * 2; k.folie.height = H;
      const f = k.folie.getContext("2d");
      const fg = f.createLinearGradient(0, 0, W * 2, H * 0.6);
      const kleuren = ["#ffd9a8", "#ffb3d1", "#c9b8ff", "#a8e1ff", "#b8ffd9"];
      const n = L.foilScale * 2 * kleuren.length;
      for (let i = 0; i <= n; i++) fg.addColorStop(i / n, kleuren[i % kleuren.length]);
      f.fillStyle = fg; f.fillRect(0, 0, W * 2, H);
      k.klaar = true;
      teken(k);
    };

    const teken = (k) => {
      if (!k.klaar) return;
      const ctx = k.ctx, W = k.cv.width, H = k.cv.height;
      ctx.clearRect(0, 0, W, H);
      if (k.p < 0.002) { ctx.drawImage(k.voor, 0, 0); return; }
      if (k.p > 0.998) { ctx.drawImage(k.achter, 0, 0); folie(k, 0, W, 1); return; }
      const N = L.strips, sw = W / N;
      const actief = 4 * k.p * (1 - k.p);
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const s = glad(clamp(k.p * (1 + L.sweep) - L.sweep * u, 0, 1));
        const th = s * Math.PI;
        const c = Math.cos(th);
        const breed = Math.max(Math.abs(c) * sw, 0.6);
        const x0 = i * sw, mid = x0 + sw / 2;
        const achter = th > Math.PI / 2;
        // breking: de twee kanten schuiven tegen elkaar in terwijl de lens draait
        const schuif = (achter ? (1 - s) : -s) * L.refraction * sw * 7;
        const sx = clamp(x0 + schuif, 0, W - sw);
        ctx.drawImage(achter ? k.achter : k.voor, sx, 0, sw, H, mid - breed / 2, 0, breed, H);
        if (achter) folie(k, mid - breed / 2, breed, s);
        const schaduw = Math.sin(th) * L.ridge * 0.6 + actief * L.ridge * 0.08;
        if (schaduw > 0.01) { ctx.fillStyle = "rgba(0,0,0," + schaduw.toFixed(3) + ")"; ctx.fillRect(mid - breed / 2, 0, breed, H); }
        const glans = Math.pow(Math.sin(th), 3) * L.ridge * 0.5;
        if (glans > 0.02) { ctx.fillStyle = "rgba(255,255,255," + glans.toFixed(3) + ")"; ctx.fillRect(mid + breed / 2 - dpr, 0, dpr, H); }
      }
    };
    const folie = (k, x, w, s) => {
      if (!L.foil) return;
      const ctx = k.ctx, W = k.cv.width, H = k.cv.height;
      ctx.save();
      ctx.globalCompositeOperation = "soft-light";
      ctx.globalAlpha = L.foil * 0.55 * (0.4 + 0.6 * s);
      const off = clamp(W * 0.5 + k.rx * W * 0.45, 0, W);
      ctx.drawImage(k.folie, x + off, 0, w, H, x, 0, w, H);
      ctx.restore();
    };

    const maat = () => {
      const breedte = view.clientWidth;
      if (!breedte) return;
      kw = breedte < 560 ? Math.round(Math.min(220, breedte * 0.62)) : 260;
      kh = Math.round(kw * 4 / 3);
      gal.style.setProperty("--lw", kw + "px");
      gal.style.setProperty("--lh", kh + "px");
      kaarten.forEach(bereid);
      zet(false);
    };
    /* Oneindig: elke kaart staat op haar afstand tot de middelste, rond
       gerekend over de hele reeks. Zo ligt na de laatste foto meteen weer de
       eerste. Een kaart die van de ene rand naar de andere springt, doet dat
       zonder overgang, buiten beeld. */
    const n = items.length;
    const zet = (zacht) => {
      const breedte = view.clientWidth;
      const x = breedte / 2 - kw / 2 + dx;
      track.style.transition = zacht && !rustig() ? "" : "none";
      track.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
      kaarten.forEach((k, i) => {
        let r = ((i - idx) % n + n) % n;
        if (r > n / 2) r -= n;
        const sprong = k.r !== undefined && Math.abs(r - k.r) > 1.5;
        if (sprong || !zacht || rustig()) k.it.style.transition = "none";
        k.it.style.setProperty("--x", (r * (kw + L.gap)).toFixed(1) + "px");
        if (sprong || !zacht) { void k.it.offsetWidth; k.it.style.transition = ""; }
        k.r = r;
        const a = i === idx;
        k.it.classList.toggle("is-active", a);
        k.btn.tabIndex = a ? 0 : -1;
        if (!a) k.doel = 0;
      });
      segmenten.forEach((s, i) => s.setAttribute("aria-current", i === idx ? "true" : "false"));
      teller.textContent = (idx + 1) + " / " + items.length;
      if (geenHover) kaarten[idx].doel = 1;  // op aanraakschermen draait de kaart in het midden zelf om
      loop();
    };
    const naar = (i) => { idx = ((i % n) + n) % n; dx = 0; zet(true); };
    // scrollen met het wiel terwijl de muis in de carrousel staat: één foto per stap
    view.addEventListener("wheel", wielStappen((r) => naar(idx + r)), { passive: false });
    vorige.addEventListener("click", () => naar(idx - 1));
    volgende.addEventListener("click", () => naar(idx + 1));
    view.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); naar(idx - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); naar(idx + 1); }
    });

    // omdraaien bij hover: hoe ver de cursor over de kaart veegt
    kaarten.forEach((k, i) => {
      k.it.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse" || i !== idx || sleep.actief) return;
        const r = k.btn.getBoundingClientRect();
        const rel = (e.clientX - r.left) / r.width;
        k.rx = clamp(rel * 2 - 1, -1, 1);
        k.doel = clamp((rel - (1 - L.travel) / 2) / L.travel, 0, 1);
        loop();
      });
      k.it.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { k.doel = 0; loop(); } });
    });

    // slepen over de strook
    const sleep = { actief: false, x0: 0, verschoven: false };
    view.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      sleep.actief = true; sleep.x0 = e.clientX; sleep.verschoven = false;
    });
    addEventListener("pointermove", (e) => {
      if (!sleep.actief) return;
      dx = e.clientX - sleep.x0;
      if (Math.abs(dx) > 6) { sleep.verschoven = true; kaarten[idx].doel = 0; }
      if (sleep.verschoven) zet(false);
    });
    addEventListener("pointerup", () => {
      if (!sleep.actief) return;
      sleep.actief = false;
      if (sleep.verschoven) {
        const stap = Math.round(-dx / (kw + L.gap));
        dx = 0; naar(idx + stap);
      }
    });
    // klik op een kaart opzij: eerst naar het midden, niet meteen de lichtbak
    view.addEventListener("click", (e) => {
      if (sleep.verschoven) { e.stopPropagation(); e.preventDefault(); sleep.verschoven = false; return; }
      const it = e.target.closest(".design-item");
      if (!it) return;
      const i = items.indexOf(it);
      if (i !== idx) { e.stopPropagation(); e.preventDefault(); naar(i); }
    }, true);
    track.addEventListener("dragstart", (e) => e.preventDefault());

    // één lus voor alle kaarten, die stilvalt zodra niets meer beweegt
    let raf = null;
    const loop = () => { if (raf === null) raf = requestAnimationFrame(stap); };
    const stap = () => {
      raf = null;
      let bezig = false;
      kaarten.forEach((k) => {
        const v = rustig() ? 1 : 0.12 * L.speed;
        const voor = k.p;
        k.p += (k.doel - k.p) * v;
        if (Math.abs(k.doel - k.p) < 0.002) k.p = k.doel;
        if (k.p !== voor) {
          bezig = bezig || k.p !== k.doel;
          teken(k);
          const lift = rustig() ? 0 : L.lift * glad(k.p);
          const kantel = rustig() ? 0 : -L.tilt * k.rx * Math.sin(k.p * Math.PI * 0.5);
          k.btn.style.transform = "translateZ(" + lift.toFixed(1) + "px) rotateY(" + kantel.toFixed(2) + "deg)";
        }
      });
      if (bezig) loop();
    };

    kaarten.forEach((k) => { if (!k.img.complete) k.img.addEventListener("load", () => bereid(k), { once: true }); });
    // de achterkant bevat tekst: pas tekenen als de lettertypes er zijn, en
    // opnieuw na een taalwissel
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => kaarten.forEach(bereid));
    addEventListener("cv-layout", () => kaarten.forEach(bereid));
    addEventListener("resize", maat);
    const fold = gal.closest("details");
    if (fold) fold.addEventListener("toggle", () => { if (fold.open) maat(); });
    maat();
  }

  /* ---------------------------------------------------------------
     Momentum ring
     --------------------------------------------------------------- */
  const R = { aspect: 1.6, size: 0.42, distance: 3, curvature: 0.6, tilt: 6, gap: 22, dim: 0.45, edgeFade: 0.5, motionBlur: 0.6, friction: 0.5 };
  let ringTeller = 0;

  function ring(gal) {
    const items = [...gal.querySelectorAll(":scope > .design-item")];
    if (items.length < 3) return;
    const n = items.length;
    const fid = "ring-blur-" + (++ringTeller);

    gal.classList.add("is-reel");
    const view = document.createElement("div");
    view.className = "reel-view";
    view.tabIndex = 0;
    view.setAttribute("role", "group");
    view.setAttribute("aria-roledescription", isEn() ? "carousel" : "carrousel");
    const ringEl = document.createElement("div");
    ringEl.className = "reel-ring";
    items.forEach((it) => ringEl.appendChild(it));
    view.appendChild(ringEl);
    // horizontale bewegingsonscherpte: een svg-filter met enkel een x-waarde
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0"); svg.setAttribute("height", "0"); svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML = '<filter id="' + fid + '" x="-20%" y="0" width="140%" height="100%"><feGaussianBlur stdDeviation="0 0"/></filter>';
    const blurEl = svg.querySelector("feGaussianBlur");
    view.appendChild(svg);
    const info = document.createElement("div");
    info.className = "reel-info";
    info.setAttribute("aria-live", "polite");
    const infoT = document.createElement("p"); infoT.className = "reel-t";
    const infoS = document.createElement("p"); infoS.className = "reel-s";
    info.append(infoT, infoS);
    const ui = document.createElement("div");
    ui.className = "gal-ui";
    const vorige = knop("gal-btn", isEn() ? "Previous" : "Vorige", "M15 18l-6-6 6-6");
    const volgende = knop("gal-btn", isEn() ? "Next" : "Volgende", "M9 18l6-6-6-6");
    const teller = document.createElement("span");
    teller.className = "gal-count";
    ui.append(vorige, teller, volgende);
    gal.append(view, info, ui);

    let rot = 0, vel = 0, doel = null, kw = 400, kh = 250, straal = 1200, stapHoek = 0.3;
    let actief = -1;

    const maat = () => {
      const b = view.clientWidth;
      if (!b) return;
      kw = Math.round(clamp(b * (b < 600 ? 0.7 : R.size), 200, 540));
      kh = Math.round(kw / R.aspect);
      straal = kw * R.distance * (1.2 - R.curvature * 0.5);
      stapHoek = (kw + R.gap) / straal;
      gal.style.setProperty("--rw", kw + "px");
      gal.style.setProperty("--rh", kh + "px");
      view.style.perspective = Math.round(kw * R.distance * 1.15) + "px";
      teken();
    };
    const wrap = (d) => ((d % n) + n + n / 2) % n - n / 2;
    const teken = () => {
      const hoekMax = Math.min(1.15, stapHoek * 3.2);
      const blur = rustig() ? 0 : Math.min(14, Math.abs(vel) * 90 * R.motionBlur);
      blurEl.setAttribute("stdDeviation", blur.toFixed(2) + " 0");
      items.forEach((it, i) => {
        const d = wrap(i - rot);
        const phi = d * stapHoek;
        const zicht = Math.abs(phi) <= hoekMax;
        it.style.visibility = zicht ? "visible" : "hidden";
        if (!zicht) return;
        it.style.transform = "translateZ(" + straal.toFixed(0) + "px) rotateY(" + (-phi).toFixed(4) + "rad) translateZ(" + (-straal).toFixed(0) + "px)";
        const rand = Math.pow(Math.abs(phi) / hoekMax, 2);
        it.style.opacity = (1 - R.edgeFade * rand).toFixed(3);
        const licht = 1 - R.dim * Math.min(1, Math.abs(d));
        it.style.filter = "brightness(" + licht.toFixed(3) + ")" + (blur > 0.3 ? " url(#" + fid + ")" : "");
      });
      const a = ((Math.round(rot) % n) + n) % n;
      if (a !== actief) {
        actief = a;
        items.forEach((it, i) => {
          it.classList.toggle("is-active", i === a);
          const b = it.querySelector(".diploma-thumb");
          if (b) b.tabIndex = i === a ? 0 : -1;
        });
        vulInfo();
      }
    };
    const vulInfo = () => {
      const it = items[actief];
      if (!it) return;
      infoT.textContent = tekst(it, ".design-cap-t");
      infoS.textContent = tekst(it, ".design-cap-s");
      teller.textContent = (actief + 1) + " / " + n;
    };

    let raf = null;
    const loop = () => { if (raf === null) raf = requestAnimationFrame(stap); };
    const wrijving = 0.9 + R.friction * 0.06;   // 0,93 bij de standaard 0,5
    const stap = () => {
      raf = null;
      if (sleep.actief) { teken(); return; }
      if (doel === null) {
        rot += vel; vel *= wrijving;
        if (Math.abs(vel) < 0.01) doel = Math.round(rot);
      } else {
        const v = (doel - rot) * (rustig() ? 1 : 0.14);
        vel = v; rot += v;
        if (Math.abs(doel - rot) < 0.001) { rot = doel; vel = 0; teken(); doel = null; normaliseer(); return; }
      }
      teken();
      loop();
    };
    const normaliseer = () => { rot = ((rot % n) + n) % n; };
    const naar = (r) => { doel = r; loop(); };
    vorige.addEventListener("click", () => naar(Math.round(rot) - 1));
    volgende.addEventListener("click", () => naar(Math.round(rot) + 1));
    view.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); naar(Math.round(rot) - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); naar(Math.round(rot) + 1); }
    });
    // horizontaal scrollen met een touchpad draait de ring; verticaal scrollt gewoon de pagina
    // horizontaal (trackpad): vrij draaien; verticaal (muiswiel): één werk per stap
    const wielStap = wielStappen((r) => naar(Math.round(doel != null ? doel : rot) + r));
    view.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) { wielStap(e); return; }
      e.preventDefault();
      doel = null; vel += e.deltaX / (kw + R.gap) * 0.12; loop();
    }, { passive: false });

    const sleep = { actief: false, x0: 0, r0: 0, laatst: 0, t: 0, verschoven: false };
    view.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      sleep.actief = true; sleep.verschoven = false;
      sleep.x0 = sleep.laatst = e.clientX; sleep.r0 = rot; sleep.t = performance.now();
      doel = null; vel = 0;
    });
    addEventListener("pointermove", (e) => {
      if (!sleep.actief) return;
      const dx = e.clientX - sleep.x0;
      if (Math.abs(dx) > 6) sleep.verschoven = true;
      if (!sleep.verschoven) return;
      const nu = performance.now();
      const nieuw = sleep.r0 - dx / (kw + R.gap);
      vel = (nieuw - rot) / Math.max(1, (nu - sleep.t) / 16.7);
      rot = nieuw; sleep.t = nu;
      loop();
    });
    addEventListener("pointerup", () => {
      if (!sleep.actief) return;
      sleep.actief = false;
      if (sleep.verschoven) { vel = clamp(vel, -0.6, 0.6); loop(); }
    });
    view.addEventListener("click", (e) => {
      if (sleep.verschoven) { e.stopPropagation(); e.preventDefault(); sleep.verschoven = false; return; }
      const it = e.target.closest(".design-item");
      if (!it) return;
      const i = items.indexOf(it);
      if (i !== actief) { e.stopPropagation(); e.preventDefault(); naar(Math.round(rot) + wrap(i - rot)); }
    }, true);
    ringEl.addEventListener("dragstart", (e) => e.preventDefault());

    addEventListener("cv-layout", vulInfo);
    addEventListener("resize", maat);
    const fold = gal.closest("details");
    if (fold) fold.addEventListener("toggle", () => { if (fold.open) maat(); });
    maat();
  }

  document.querySelectorAll(".gallery-photos").forEach(lenticulair);
  document.querySelectorAll("#werk .gallery").forEach(ring);
})();
