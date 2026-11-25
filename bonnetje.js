/* ============================================================
   Victor Van Sande - CV website  ·  snapshot op een bonnetje
   ------------------------------------------------------------
   Onderaan de site print een kleine thermische printer de kern van het cv
   op een bonnetje: naam, rol, de acht kernfeiten en de contactgegevens. Het
   bonnetje kan je bewaren als afbeelding, of omhoog slepen om het af te
   scheuren. Eigen bouw, geïnspireerd op de Receipt Printer van React Bits
   Pro (zonder hun code).

   Het bonnetje wordt op een canvas getekend: wat je ziet en wat je bewaart
   is daardoor exact hetzelfde beeld. De tekst komt uit de pagina zelf (de
   essentie bovenaan), dus het bonnetje volgt vanzelf de gekozen taal.
   ============================================================ */
(() => {
  "use strict";

  const blok = document.querySelector(".snap");
  if (!blok) return;
  const schuif = blok.querySelector(".schuif");
  const vak = blok.querySelector(".snap-area");
  const papier = blok.querySelector(".snap-sheet");  // wordt afgescheurd
  const cv = blok.querySelector(".snap-cv");
  const led = blok.querySelector(".snap-led");
  const hint = blok.querySelector(".snap-hint");
  const ctx = cv.getContext("2d");
  const B = 280;                       // papierbreedte in css-pixels
  const SCHAAL = 2;                    // tekenresolutie, ook voor de bewaarde afbeelding
  const INKT = "#25252a", DIM = "#77736c", PAPIER = "#f1efea";
  const MONO = '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace';
  const rustig = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.motion === "reduce";
  const en = () => document.documentElement.lang === "en";
  const tekst = (sel) => { const el = document.querySelector(sel); return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; };
  const sjabloon = (naam) => { const el = blok.querySelector('[data-sjabloon="' + naam + '"]'); return el ? el.textContent.trim() : ""; };

  /* ---- de inhoud, als lijst regels ---- */
  const inhoud = () => {
    const nu = new Date();
    const nr = String((nu.getMonth() + 1) * 100 + nu.getDate()).padStart(4, "0");
    const uur = nu.toLocaleTimeString(en() ? "en-GB" : "nl-BE", { hour: "2-digit", minute: "2-digit" });
    const dag = nu.toLocaleDateString(en() ? "en-GB" : "nl-BE", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    const r = [
      { t: "titel", s: "VICTOR VAN SANDE" },
      { t: "mid", s: tekst('[data-i18n="hero_role"]').replace(/\.$/, "") },
      { t: "ruimte", h: 8 },
      { t: "rij", l: "SNAPSHOT #" + nr, r: uur, dim: true },
      { t: "rij", l: dag, r: "", dim: true },
      { t: "lijn" },
    ];
    document.querySelectorAll(".essentie .facts > div").forEach((d) => {
      const dt = d.querySelector("dt"), dd = d.querySelector("dd:not(.sub)");
      if (!dt || !dd) return;
      r.push({ t: "label", s: dt.textContent.trim().toUpperCase() });
      r.push({ t: "tekst", s: dd.textContent.replace(/\s+/g, " ").trim() });
      r.push({ t: "ruimte", h: 5 });
    });
    r.push({ t: "lijn" });
    r.push({ t: "rij", l: "E-MAIL", r: "victorvansande@gmail.com" });
    r.push({ t: "rij", l: en() ? "PHONE" : "TEL", r: "0479 87 81 52" });
    r.push({ t: "rij", l: "LINKEDIN", r: "in/victorvansande" });
    r.push({ t: "lijn" });
    r.push({ t: "streep", s: "victorvansande.github.io/cv" });
    r.push({ t: "mid", s: "victorvansande.github.io/cv", dim: true });
    r.push({ t: "ruimte", h: 6 });
    r.push({ t: "mid", s: sjabloon("dank") });
    return r;
  };

  /* ---- tekenen ---- */
  const PAD = 18, LH = 15;
  const breek = (s, max) => {
    const uit = []; let regel = "";
    s.split(" ").forEach((w) => {
      const p = regel ? regel + " " + w : w;
      if (ctx.measureText(p).width > max && regel) { uit.push(regel); regel = w; } else regel = p;
    });
    if (regel) uit.push(regel);
    return uit;
  };
  // eerst meten (hoogte), dan tekenen: dezelfde lus met een vlag
  const loop = (regels, teken) => {
    let y = 26;
    const binnen = B - 2 * PAD;
    regels.forEach((g) => {
      if (g.t === "titel") {
        ctx.font = "600 15px " + MONO; ctx.textAlign = "center";
        if (teken) { ctx.fillStyle = INKT; ctx.letterSpacing = "2px"; ctx.fillText(g.s, B / 2, y + 12); ctx.letterSpacing = "0px"; }
        y += 22;
      } else if (g.t === "mid") {
        ctx.font = "400 11px " + MONO; ctx.textAlign = "center";
        breek(g.s, binnen).forEach((l) => { if (teken) { ctx.fillStyle = g.dim ? DIM : INKT; ctx.fillText(l, B / 2, y + 11); } y += LH; });
      } else if (g.t === "rij") {
        ctx.font = "400 11px " + MONO;
        if (teken) {
          ctx.fillStyle = g.dim ? DIM : INKT;
          ctx.textAlign = "left"; ctx.fillText(g.l, PAD, y + 11);
          ctx.textAlign = "right"; ctx.fillText(g.r, B - PAD, y + 11);
        }
        y += LH;
      } else if (g.t === "label") {
        ctx.font = "600 9.5px " + MONO; ctx.textAlign = "left";
        if (teken) { ctx.fillStyle = DIM; ctx.letterSpacing = "1px"; ctx.fillText(g.s, PAD, y + 10); ctx.letterSpacing = "0px"; }
        y += 13;
      } else if (g.t === "tekst") {
        ctx.font = "400 11.5px " + MONO; ctx.textAlign = "left";
        breek(g.s, binnen).forEach((l) => { if (teken) { ctx.fillStyle = INKT; ctx.fillText(l, PAD, y + 11); } y += LH; });
      } else if (g.t === "lijn") {
        if (teken) {
          ctx.fillStyle = INKT;
          for (let x = PAD; x < B - PAD; x += 6) ctx.fillRect(x, y + 7, 3, 1);
        }
        y += 15;
      } else if (g.t === "streep") {
        // streepjescode uit de tekens van de link: telkens dezelfde voor dezelfde link.
        // Easter egg: op één plek lopen de balkjes samen tot een dicht blok, en
        // daaruit zijn de initialen VVS in negative space uitgespaard (in de letter
        // van de naam). Het blok wordt apart getekend, zodat het uitsparen de rest
        // van het bonnetje niet raakt.
        if (teken) {
          const st = document.createElement("canvas");
          st.width = B * SCHAAL; st.height = 48 * SCHAAL;
          const k = st.getContext("2d");
          k.scale(SCHAAL, SCHAAL);
          k.fillStyle = INKT;
          let x = PAD + 10; const eind = B - PAD - 10;
          let i = 0;
          while (x < eind) {
            const c = g.s.charCodeAt(i % g.s.length) + i * 7;
            const w = 1 + (c % 3), gat = 1 + ((c >> 2) % 3);
            k.fillRect(x, 4, w, 38);
            x += w + gat; i++;
          }
          k.font = '800 30px "Big Shoulders Display", "Arial Narrow", sans-serif';
          k.textBaseline = "middle"; k.textAlign = "center";
          const tw = k.measureText("VVS").width, bw = Math.round(tw + 14), bx = Math.round(PAD + 10 + (eind - PAD - 10) * 0.62 - bw / 2);
          k.fillRect(bx, 4, bw, 38);
          k.globalCompositeOperation = "destination-out";
          k.fillText("VVS", bx + bw / 2, 4 + 19 + 1);
          ctx.drawImage(st, 0, y, B, 48);
        }
        y += 48;
      } else if (g.t === "ruimte") {
        y += g.h;
      }
    });
    return y + 22;
  };
  // de rand van thermisch papier: een fijne kartelrand onder- en bovenaan
  const kartel = (h) => {
    ctx.beginPath();
    ctx.moveTo(0, 6);
    for (let x = 0; x <= B; x += 8) ctx.lineTo(x + 4, 0), ctx.lineTo(x + 8, 6);
    ctx.lineTo(B, h - 6);
    for (let x = B; x >= 0; x -= 8) ctx.lineTo(x - 4, h), ctx.lineTo(x - 8, h - 6);
    ctx.closePath();
  };
  let hoogte = 0;
  const maak = () => {
    const regels = inhoud();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    hoogte = Math.ceil(loop(regels, false));
    cv.width = B * SCHAAL; cv.height = hoogte * SCHAAL;
    cv.style.width = B + "px"; cv.style.height = hoogte + "px";
    ctx.setTransform(SCHAAL, 0, 0, SCHAAL, 0, 0);
    ctx.clearRect(0, 0, B, hoogte);
    kartel(hoogte);
    ctx.fillStyle = PAPIER; ctx.fill();
    ctx.save(); ctx.clip();
    loop(regels, true);
    ctx.restore();
  };

  /* ---- printen, scheuren, bewaren ---- */
  let bezig = false, geprint = false;
  /* Het bonnetje rolt over de site: het vak onder de printer neemt geen
     plaats in, het papier staat erboven en schuift telkens wat verder uit de
     gleuf. Wat nog "in de printer" zit, valt weg door de clip-path van het
     vak (enkel onderaan). Zo verschuift er niets op de pagina; wie hier is,
     heeft wat erboven staat doorgaans al gelezen. */
  const feed = blok.querySelector(".snap-feed");
  /* Het papier dat nog "in de printer" zit, staat onder de gleuf en is daar
     onzichtbaar, maar telt wel mee voor de hoogte van de pagina: onderaan
     verscheen dan een lege strook. Daarom staat het papier helemaal uit
     zolang er niets geprint wordt of hangt. */
  const vel = feed.querySelector(".snap-paper");
  const zetHoogte = (h) => {
    vel.style.display = h > 0 || bezig ? "" : "none";
    vel.style.transform = "translateY(" + (hoogte - h).toFixed(1) + "px)";
  };
  const zetVak = () => zetHoogte(geprint || bezig ? hoogte : 0);
  const print = () => {
    if (bezig) return;
    bezig = true;
    // eerst het lettertype van het bonnetje, anders tekent het canvas in een vervanglettertype
    const lt = document.fonts && document.fonts.load ? Promise.all([document.fonts.load('400 11px "IBM Plex Mono"'), document.fonts.load('800 30px "Big Shoulders Display"')]).catch(() => {}) : Promise.resolve();
    Promise.race([lt, new Promise((r) => setTimeout(r, 1200))]).then(voeren);
  };
  const voeren = () => {
    reset();
    maak();
    zetHoogte(0);
    led.classList.add("aan");
    const klaar = () => {
      bezig = false; geprint = true;
      led.classList.remove("aan");
      zetVoortgang(1);
      loaderKlaar();
      schuif.classList.add("klaar");
      // eerst even het vinkje met de tijd, dan krimpt de schuif tot de bewaarknop
      setTimeout(() => { if (geprint && schuif.dataset.staat === "print") naarStaat("bewaar"); }, rustig() ? 600 : 1100);
      if (hint) hint.hidden = false;
    };
    if (rustig()) { zetHoogte(hoogte); klaar(); return; }
    // het papier komt gelijkmatig naar buiten, met een zachte aanloop en uitloop;
    // de balk in de schuif loopt gelijk op
    const duur = Math.max(1600, hoogte * 4.2), t0 = performance.now();
    const glad = (t) => t * t * (3 - 2 * t);
    const stap = (nu) => {
      const p = Math.min(1, (nu - t0) / duur);
      zetHoogte(glad(p) * hoogte);
      zetVoortgang(glad(p));
      if (p < 1) requestAnimationFrame(stap); else setTimeout(klaar, 180);
    };
    requestAnimationFrame(stap);
  };

  /* ---- Schuifknop (eigen bouw naar de Slide to Confirm van Kokonut UI) ----
     Eén element dat van vorm verandert, zie de css onder "Schuifknop om te
     printen". De greep volgt de vinger 1-op-1 (gebundeld per beeld); voorbij
     90 % klikt hij vast en begint de printer, anders veert hij terug. Een
     gewone klik geeft een duwtje als hint; met het toetsenbord (Enter,
     spatie) print hij meteen, want slepen kan daar niet. Na het printen krimpt
     de schuif tot de bewaarknop: de breedte wordt gemeten en vastgezet, zodat
     er een overgang tussen kan lopen. */
  const greep = schuif.querySelector(".schuif-greep");
  const bewaarKnop = schuif.querySelector(".schuif-bewaar");
  const bewaarTxt = schuif.querySelector(".schuif-bewaar-txt");
  const status = schuif.querySelector(".schuif-status");
  const sch = { actief: false, x0: 0, x: 0, max: 0, bewogen: false, raf: 0, doel: 0 };
  const zetX = (x) => {
    sch.x = Math.max(0, Math.min(sch.max, x));
    schuif.style.setProperty("--x", sch.x + "px");
    schuif.style.setProperty("--p", sch.max ? (sch.x / sch.max).toFixed(3) : 0);
  };
  /* Lattice Loader (React Bits, variant JS-CSS), omgezet naar gewone
     javascript met de instellingen van Victor: orbit, raster van 3, rond,
     cel 6 px, tussenruimte 2, tekst 14 px, stap 90 ms, rust 0.15, geen gloed,
     met timer. Wat de React-component per render uitrekent, staat hier vast:
     orbit in 3 geeft d = 90 * 1.2 = 108 ms per stap en een cyclus van 864 ms. */
  const LL = { cells: [0, 1, 2, 7, null, 3, 6, 5, 4], d: 108, cycle: 864, done: [2, 3, 5, 7] };
  const tijd = (ds) => {
    const t = ds < 600 ? (ds / 10).toFixed(1) + "s" : Math.floor(ds / 600) + "m " + ((ds % 600) / 10).toFixed(1) + "s";
    return en() ? t : t.replace(".", ",");
  };
  const loader = { el: null, timer: null, id: 0, t0: 0, ds: 0 };
  const maakLoader = () => {
    const el = document.createElement("span");
    el.className = "lattice-loader";
    el.setAttribute("role", "status");
    el.dataset.status = "working"; el.dataset.shape = "round";
    Object.entries({ "--ll-n": 3, "--ll-cell": "6px", "--ll-gap": "2px", "--ll-font": "14px", "--ll-color": "currentColor", "--ll-mark": "#22c55e",
      "--ll-idle": 0.15, "--ll-glow": "currentColor", "--ll-mark-glow": "#22c55e", "--ll-cycle": LL.cycle + "ms" }).forEach(([k, v]) => el.style.setProperty(k, v));
    const run = LL.cells.map((u) => u == null ? '<span class="lattice-loader__cell" data-hole=""></span>'
      : '<span class="lattice-loader__cell" style="animation-delay:' + Math.round(u * LL.d) + 'ms"></span>').join("");
    const mark = LL.cells.map((_, i) => '<span class="lattice-loader__cell"' + (LL.done.includes(i) ? ' data-on=""' : "") + "></span>").join("");
    el.innerHTML = '<span class="lattice-loader__grid" aria-hidden="true"><span class="lattice-loader__layer lattice-loader__run">' + run +
      '</span><span class="lattice-loader__layer lattice-loader__mark">' + mark + "</span></span>" +
      '<span class="lattice-loader__label" aria-hidden="true"><span class="lattice-loader__text" data-active=""></span><span class="lattice-loader__text"></span></span>' +
      '<span class="lattice-loader__timer" aria-hidden="true">' + tijd(0) + '</span><span class="lattice-loader__sr"></span>';
    return el;
  };
  const loaderTeksten = () => {
    if (!loader.el) return;
    const t = loader.el.querySelectorAll(".lattice-loader__text");
    t[0].textContent = sjabloon("bezig").replace(/[.…]+$/, "");
    t[1].textContent = sjabloon("klaar");
    loader.el.querySelector(".lattice-loader__timer").textContent = tijd(loader.ds);
  };
  const startLoader = () => {
    status.textContent = "";
    loader.el = maakLoader(); status.appendChild(loader.el);
    loader.ds = 0; loaderTeksten();
    loader.el.querySelector(".lattice-loader__sr").textContent = sjabloon("bezig");
    loader.t0 = performance.now();
    clearInterval(loader.id);
    loader.id = setInterval(() => {
      loader.ds = Math.floor((performance.now() - loader.t0) / 100);
      loader.el.querySelector(".lattice-loader__timer").textContent = tijd(loader.ds);
    }, 100);
  };
  const loaderKlaar = () => {
    clearInterval(loader.id);
    if (!loader.el) return;
    loader.el.dataset.status = "done";
    const t = loader.el.querySelectorAll(".lattice-loader__text");
    t[0].removeAttribute("data-active"); t[1].setAttribute("data-active", "");
    loader.el.querySelector(".lattice-loader__sr").textContent = sjabloon("klaar") + " " + tijd(loader.ds);
  };
  const zetVoortgang = (v) => schuif.style.setProperty("--v", v.toFixed(4));
  const meet = () => { sch.max = Math.max(0, schuif.clientWidth - 4 - greep.offsetWidth); };
  const bewaarBreedte = () => Math.ceil(schuif.querySelector(".schuif-bewaar-in").scrollWidth + 44);
  const naarStaat = (st) => {
    schuif.dataset.staat = st;
    if (st === "rust") {
      schuif.style.removeProperty("--w"); zetVoortgang(0); zetX(0);
      clearInterval(loader.id); loader.el = null; schuif.classList.remove("klaar");
      bewaarKnop.tabIndex = -1; greep.tabIndex = 0; status.textContent = "";
      if (document.activeElement === bewaarKnop) greep.focus({ preventScroll: true });
    } else if (st === "print") {
      schuif.classList.remove("klaar");
      startLoader();
      greep.tabIndex = -1;
    } else if (st === "bewaar") {
      bewaarTxt.textContent = sjabloon("bewaar");
      schuif.style.setProperty("--w", bewaarBreedte() + "px");
      bewaarKnop.tabIndex = 0;
      if (document.activeElement === greep || document.activeElement === document.body) bewaarKnop.focus({ preventScroll: true });
    }
  };
  const bevestig = () => {
    meet(); zetX(sch.max);
    naarStaat("print");
    print();
  };
  greep.addEventListener("pointerdown", (e) => {
    if (bezig || schuif.dataset.staat !== "rust" || e.button > 0) return;
    meet();
    sch.actief = true; sch.bewogen = false; sch.x0 = e.clientX - sch.x;
    greep.setPointerCapture(e.pointerId);
    schuif.classList.add("sleept");
  });
  greep.addEventListener("pointermove", (e) => {
    if (!sch.actief) return;
    sch.doel = e.clientX - sch.x0;
    if (Math.abs(sch.doel - sch.x) > 2) sch.bewogen = true;
    if (!sch.raf) sch.raf = requestAnimationFrame(() => { sch.raf = 0; zetX(sch.doel); });
  });
  const losGreep = () => {
    if (!sch.actief) return;
    sch.actief = false;
    if (sch.raf) { cancelAnimationFrame(sch.raf); sch.raf = 0; zetX(sch.doel); }
    schuif.classList.remove("sleept");
    if (sch.max && sch.x / sch.max > 0.9) bevestig(); else zetX(0);
  };
  greep.addEventListener("pointerup", losGreep);
  greep.addEventListener("pointercancel", losGreep);
  greep.addEventListener("click", (e) => {
    if (sch.bewogen) { sch.bewogen = false; return; }
    if (schuif.dataset.staat !== "rust") return;
    if (e.detail === 0) { bevestig(); return; }       // toetsenbord
    if (rustig()) return;
    meet(); zetX(Math.min(28, sch.max));               // duwtje: zo moet het
    setTimeout(() => { if (schuif.dataset.staat === "rust") zetX(0); }, 260);
  });
  bewaarKnop.addEventListener("click", () => { if (schuif.dataset.staat === "bewaar") bewaar(); });

  let bewaardTimer = null;
  const bewaarLabel = (t) => {
    bewaarTxt.classList.add("weg");
    setTimeout(() => {
      bewaarTxt.textContent = t;
      bewaarTxt.classList.remove("weg");
      if (schuif.dataset.staat === "bewaar") schuif.style.setProperty("--w", bewaarBreedte() + "px");
    }, 160);
  };
  const bewaar = () => {
    bewaarLabel(sjabloon("bewaard"));
    clearTimeout(bewaardTimer);
    bewaardTimer = setTimeout(() => { if (geprint) bewaarLabel(sjabloon("bewaar")); }, 1800);
    cv.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "victor-van-sande-snapshot.png";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  };

  /* ---- Afscheuren ----
     Zoals bij een echte kassabon: trek het bonnetje opzij of omhoog. Opzij
     draait het papier rond de hoek bij de gleuf aan de kant waar je naartoe
     trekt; de andere hoek komt los van de scheurrand, zodat de scheur van die
     kant naar binnen loopt. Voorbij de drempel scheurt het af: de laatste
     millimeters gaan in één ruk, de printer schokt even, en het papier zwiert
     weg in de richting van je beweging. Niet ver genoeg getrokken, dan veert
     het terug. Omhoog trekken blijft ook werken. */
  const printer = blok.querySelector(".snap-printer");
  const sleep = { actief: false, x0: 0, y0: 0, t0: 0, modus: null, hoek: 0, dy: 0, vx: 0, lx: 0, lt: 0 };
  const MAX = 18;                                    // grootste hoek tijdens het trekken
  const zetPapier = (t) => { papier.style.transform = t; };
  const reset = () => {
    papier.getAnimations().forEach((a) => a.cancel());
    papier.style.transition = "none"; zetPapier(""); papier.style.transformOrigin = "";
    papier.style.opacity = ""; feed.style.clipPath = "";
    papier.classList.remove("gescheurd");
  };
  const afgescheurd = () => {
    geprint = false;
    clearTimeout(bewaardTimer);
    if (hint) hint.hidden = true;
    naarStaat("rust");
  };
  const scheurOpzij = (dir) => {
    afgescheurd();
    const w = papier.offsetWidth, h = papier.offsetHeight;
    const van = sleep.hoek;
    if (rustig()) { reset(); zetVak(); return; }
    const a = papier.animate([
      { transform: "rotate(" + van + "deg)", opacity: 1, offset: 0 },
      { transform: "rotate(" + (dir * 24) + "deg)", opacity: 1, offset: 0.2, easing: "cubic-bezier(.5,0,.9,.5)" },
      { transform: "translate(" + (dir * w * 0.35) + "px," + (-h * 0.04) + "px) rotate(" + (dir * 30) + "deg)", opacity: 1, offset: 0.42 },
      { transform: "translate(" + (dir * w * 1.5) + "px," + (h * 0.22) + "px) rotate(" + (dir * 52) + "deg)", opacity: 0, offset: 1 },
    ], { duration: 820, easing: "cubic-bezier(.3,.1,.6,1)", fill: "forwards" });
    // het moment van de ruk: de printer schokt even mee
    setTimeout(() => printer.animate([
      { transform: "none" }, { transform: "translate(" + (dir * 1.5) + "px, 1.5px)" }, { transform: "none" },
    ], { duration: 160, easing: "ease-out" }), 150);
    a.onfinish = () => { reset(); zetVak(); };
  };
  const scheurOmhoog = () => {
    afgescheurd();
    papier.style.transition = "";
    papier.classList.add("gescheurd");
    setTimeout(() => { reset(); zetVak(); }, 650);
  };
  const terug = () => {
    const van = papier.style.transform || "none";
    papier.style.transition = "none";
    const a = papier.animate([{ transform: van }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.3,1.5,.5,1)" });
    zetPapier("");
    a.onfinish = () => { papier.style.transformOrigin = ""; };
  };

  papier.addEventListener("pointerdown", (e) => {
    if (!geprint || bezig) return;
    Object.assign(sleep, { actief: true, x0: e.clientX, y0: e.clientY, t0: performance.now(), modus: null, hoek: 0, dy: 0, vx: 0, lx: e.clientX, lt: performance.now() });
    papier.setPointerCapture(e.pointerId);
    papier.style.transition = "none";
  });
  papier.addEventListener("pointermove", (e) => {
    if (!sleep.actief) return;
    const dx = e.clientX - sleep.x0, dy = e.clientY - sleep.y0, nu = performance.now();
    sleep.vx = (e.clientX - sleep.lx) / Math.max(1, nu - sleep.lt); sleep.lx = e.clientX; sleep.lt = nu;
    if (!sleep.modus && Math.hypot(dx, dy) > 6) sleep.modus = Math.abs(dx) > Math.abs(dy) ? "zij" : "op";
    if (sleep.modus === "zij") {
      // draaien rond de hoek aan de kant waar je naartoe trekt, met toenemende weerstand
      papier.style.transformOrigin = dx > 0 ? "100% 100%" : "0% 100%";
      sleep.hoek = MAX * Math.tanh(dx / 260);
      zetPapier("rotate(" + sleep.hoek.toFixed(2) + "deg)");
    } else if (sleep.modus === "op") {
      sleep.dy = Math.min(0, dy);
      zetPapier("translateY(" + (sleep.dy * 0.6).toFixed(1) + "px) rotate(" + (sleep.dy * -0.02).toFixed(2) + "deg)");
    }
  });
  const los = (e) => {
    if (!sleep.actief) return;
    sleep.actief = false;
    if (sleep.modus === "zij") {
      const dir = Math.sign(sleep.hoek) || 1;
      if (Math.abs(sleep.hoek) > 8 || Math.abs(sleep.vx) > 0.7) scheurOpzij(Math.sign(sleep.vx) && Math.abs(sleep.vx) > 0.7 ? Math.sign(sleep.vx) : dir);
      else terug();
    } else if (sleep.modus === "op") {
      const snel = sleep.dy / Math.max(1, performance.now() - sleep.t0);
      if (sleep.dy < -70 || snel < -0.8) scheurOmhoog(); else terug();
    }
  };
  papier.addEventListener("pointerup", los);
  papier.addEventListener("pointercancel", los);

  // bij een taalwissel staat het bonnetje er in de vorige taal: opnieuw tekenen
  addEventListener("cv-layout", () => {
    loaderTeksten();
    if (schuif.dataset.staat === "bewaar") { bewaarTxt.textContent = sjabloon("bewaar"); schuif.style.setProperty("--w", bewaarBreedte() + "px"); }
    if (geprint && !bezig) { maak(); zetVak(); }
  });
  // het lettertype van het bonnetje alvast ophalen
  if (document.fonts && document.fonts.load) document.fonts.load('400 11px "IBM Plex Mono"');
})();
