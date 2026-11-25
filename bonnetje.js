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
  /* ---- Prop maken na het afscheuren ----
     Eigen bouw naar de Paper Crumple van React Bits (zonder hun code, want
     deze site heeft geen React): het afgescheurde bonnetje wordt een raster
     van driehoekjes met de bedrukte beeltenis erop, dat in ongeveer een halve
     seconde samenvouwt tot een prop. De vouwen volgen een vloeiend ruisveld,
     zodat er facetten ontstaan in plaats van losse snippers; elk facet krijgt
     licht of schaduw van een lichtbron linksboven, en een omgeklapt facet toont
     de blanco achterkant. Daarna valt de prop weg in de richting van de ruk,
     draait en vervaagt. Afgestemd op de lange, smalle vorm van het bonnetje:
     meer rijen dan kolommen, en een prop van ongeveer een derde van de breedte. */
  const prop = (dir, klaar, naMeten) => {
    // waar staat het bonnetje nu, ook als het nog scheef hangt van het trekken?
    const cs = getComputedStyle(papier);
    const M = cs.transform && cs.transform !== "none" ? new DOMMatrix(cs.transform) : new DOMMatrix();
    const oorsprong = cs.transformOrigin.split(" ").map(parseFloat);
    const bewaar = papier.style.transform;
    papier.style.transition = "none"; papier.style.transform = "none";
    const pr = papier.getBoundingClientRect(), cr = cv.getBoundingClientRect();
    papier.style.transform = bewaar;
    const lx0 = cr.left - pr.left, ly0 = cr.top - pr.top, w = cr.width, h = cr.height;
    // pas na het meten de rest bijwerken: afgescheurd() verbergt de hint boven
    // het bonnetje, en dan schuift alles op (de prop begon 33 px te hoog)
    if (naMeten) naMeten();
    if (!w || !h) { klaar(); return; }
    const naarScherm = (lx, ly) => {
      const x = lx - oorsprong[0], y = ly - oorsprong[1];
      return [pr.left + oorsprong[0] + M.a * x + M.c * y + M.e, pr.top + oorsprong[1] + M.b * x + M.d * y + M.f];
    };
    // kopie van de beeltenis: het canvas zelf wordt bij een volgende print overschreven
    const beeld = document.createElement("canvas");
    beeld.width = cv.width; beeld.height = cv.height;
    beeld.getContext("2d").drawImage(cv, 0, 0);
    papier.style.opacity = "0";

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const doek = document.createElement("canvas");
    doek.setAttribute("aria-hidden", "true");
    doek.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
    doek.width = Math.round(innerWidth * dpr); doek.height = Math.round(innerHeight * dpr);
    document.body.appendChild(doek);
    const g = doek.getContext("2d");

    const KOL = 7, RIJ = Math.max(10, Math.round(KOL * h / w));
    // vloeiend ruisveld: willekeurige waarden op een grof rooster, zacht geïnterpoleerd
    const veld = (gx, gy) => { const v = []; for (let i = 0; i <= gx; i++) { v[i] = []; for (let j = 0; j <= gy; j++) v[i][j] = Math.random() * 2 - 1; } return v; };
    const zacht = (t) => t * t * (3 - 2 * t);
    const lees = (v, gx, gy, u, w2) => {
      const x = u * gx, y = w2 * gy, i = Math.min(gx - 1, Math.floor(x)), j = Math.min(gy - 1, Math.floor(y));
      const fx = zacht(x - i), fy = zacht(y - j);
      const a1 = v[i][j] + (v[i + 1][j] - v[i][j]) * fx, a2 = v[i][j + 1] + (v[i + 1][j + 1] - v[i][j + 1]) * fx;
      return a1 + (a2 - a1) * fy;
    };
    const GX = 3, GY = 6, vx = veld(GX, GY), vy = veld(GX, GY), vz = veld(GX, GY);
    const midden = naarScherm(lx0 + w / 2, ly0 + h / 2);
    const R = Math.max(34, w * 0.19);
    const doel = [midden[0] + dir * w * 0.06, midden[1] - h * 0.04];
    const punten = [];
    for (let j = 0; j <= RIJ; j++) for (let i = 0; i <= KOL; i++) {
      const u = i / KOL, v = j / RIJ;
      const [x0, y0] = naarScherm(lx0 + u * w, ly0 + v * h);
      let dx = (u - 0.5) * w * 0.14 + R * 0.95 * lees(vx, GX, GY, u, v);
      let dy = (v - 0.5) * h * 0.08 + R * 0.95 * lees(vy, GX, GY, u, v);
      const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; }
      const z = R * lees(vz, GX, GY, u, v) * (0.6 + 0.4 * Math.random());
      // de randen vouwen iets later dan het midden
      const vertraging = Math.min(1, Math.hypot(u - 0.5, (v - 0.5) * 0.6) * 1.6) * 0.22;
      punten.push({ x0, y0, x1: doel[0] + dx, y1: doel[1] + dy, z1: z, sx: u * beeld.width, sy: v * beeld.height, d: vertraging });
    }
    const drie = [];
    for (let j = 0; j < RIJ; j++) for (let i = 0; i < KOL; i++) {
      const a1 = j * (KOL + 1) + i, b1 = a1 + 1, c1 = a1 + KOL + 1, d1 = c1 + 1;
      drie.push([a1, b1, c1], [b1, d1, c1]);
    }
    const L = (() => { const x = Math.cos(-60 * Math.PI / 180), y = Math.sin(-60 * Math.PI / 180), z = 0.9, n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; })();
    const T_VOUW = 560, T_VAL = 950;
    const tekenDriehoek = (p, q, r, zon, achter) => {
      // iets groter dan nodig, anders zie je dunne naden tussen de facetten
      const cx = (p[0] + q[0] + r[0]) / 3, cy = (p[1] + q[1] + r[1]) / 3;
      const groei = (pt) => { const ex = pt[0] - cx, ey = pt[1] - cy, l = Math.hypot(ex, ey) || 1; return [pt[0] + ex / l * 0.7, pt[1] + ey / l * 0.7]; };
      const P = groei(p), Q = groei(q), Rr = groei(r);
      g.save();
      g.beginPath(); g.moveTo(P[0] * dpr, P[1] * dpr); g.lineTo(Q[0] * dpr, Q[1] * dpr); g.lineTo(Rr[0] * dpr, Rr[1] * dpr); g.closePath();
      g.clip();
      if (achter) { g.fillStyle = PAPIER; g.fill(); }
      else {
        const [x0, y0] = [p[3], p[4]], [x1, y1] = [q[3], q[4]], [x2, y2] = [r[3], r[4]];
        const [u0, v0, u1, v1, u2, v2] = [p[0] * dpr, p[1] * dpr, q[0] * dpr, q[1] * dpr, r[0] * dpr, r[1] * dpr];
        const den = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1);
        if (Math.abs(den) > 1e-6) {
          g.setTransform(
            (u0 * (y1 - y2) + u1 * (y2 - y0) + u2 * (y0 - y1)) / den,
            (v0 * (y1 - y2) + v1 * (y2 - y0) + v2 * (y0 - y1)) / den,
            (u0 * (x2 - x1) + u1 * (x0 - x2) + u2 * (x1 - x0)) / den,
            (v0 * (x2 - x1) + v1 * (x0 - x2) + v2 * (x1 - x0)) / den,
            (u0 * (x1 * y2 - x2 * y1) + u1 * (x2 * y0 - x0 * y2) + u2 * (x0 * y1 - x1 * y0)) / den,
            (v0 * (x1 * y2 - x2 * y1) + v1 * (x2 * y0 - x0 * y2) + v2 * (x0 * y1 - x1 * y0)) / den);
          g.drawImage(beeld, 0, 0);
          g.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
      // licht en schaduw van het facet
      if (zon < 0) { g.fillStyle = "rgba(20,18,16," + (-zon * 0.55).toFixed(3) + ")"; g.fill(); }
      else if (zon > 0) { g.fillStyle = "rgba(255,255,255," + (zon * 0.22).toFixed(3) + ")"; g.fill(); }
      g.restore();
    };
    const vallen = { vx: dir * 260 + (dir ? 0 : (Math.random() - 0.5) * 80), vy: -140, rot: (dir || (Math.random() < 0.5 ? -1 : 1)) * 2.6 };
    const start = performance.now();
    const beeldje = (nu) => {
      const t = nu - start;
      const k = Math.min(1, t / T_VOUW), tv = Math.max(0, t - T_VOUW) / 1000;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, doek.width, doek.height);
      const ox = vallen.vx * tv, oy = vallen.vy * tv + 0.5 * 1500 * tv * tv;
      const hoek = vallen.rot * tv, ch = Math.cos(hoek), sh = Math.sin(hoek);
      const cx = doel[0], cy = doel[1];
      const pos = punten.map((pt) => {
        const e0 = Math.min(1, Math.max(0, (k - pt.d) / (1 - pt.d)));
        const e = e0 < 0.5 ? 4 * e0 * e0 * e0 : 1 - Math.pow(-2 * e0 + 2, 3) / 2;
        let x = pt.x0 + (pt.x1 - pt.x0) * e, y = pt.y0 + (pt.y1 - pt.y0) * e;
        const z = pt.z1 * e;
        if (tv > 0) { const rx = x - cx, ry = y - cy; x = cx + rx * ch - ry * sh + ox; y = cy + rx * sh + ry * ch + oy; }
        return [x, y, z, pt.sx, pt.sy, e];
      });
      g.globalAlpha = tv > 0 ? Math.max(0, 1 - Math.max(0, tv - 0.25) / (T_VAL / 1000 - 0.25)) : 1;
      const lijst = drie.map((d) => {
        const p = pos[d[0]], q = pos[d[1]], r = pos[d[2]];
        const ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], wx = r[0] - p[0], wy = r[1] - p[1], wz = r[2] - p[2];
        let nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
        const n = Math.hypot(nx, ny, nz) || 1;
        const achter = nz < 0;
        if (achter) { nx = -nx; ny = -ny; nz = -nz; }
        const licht = (nx * L[0] + ny * L[1] + nz * L[2]) / n;
        const e = (p[5] + q[5] + r[5]) / 3;
        return { p, q, r, zon: (licht - 0.72) * 2.2 * e, achter, z: (p[2] + q[2] + r[2]) / 3 };
      });
      lijst.sort((a2, b2) => a2.z - b2.z);
      lijst.forEach((f) => tekenDriehoek(f.p, f.q, f.r, Math.max(-1, Math.min(1, f.zon)), f.achter));
      if (t < T_VOUW + T_VAL) requestAnimationFrame(beeldje);
      else { doek.remove(); klaar(); }
    };
    requestAnimationFrame(beeldje);
  };

  const scheurOpzij = (dir) => {
    if (rustig()) { afgescheurd(); reset(); zetVak(); return; }
    // het moment van de ruk: de printer schokt even mee
    printer.animate([
      { transform: "none" }, { transform: "translate(" + (dir * 1.5) + "px, 1.5px)" }, { transform: "none" },
    ], { duration: 160, easing: "ease-out" });
    prop(dir, () => { reset(); zetVak(); }, afgescheurd);
  };
  const scheurOmhoog = () => {
    if (rustig()) { afgescheurd(); reset(); zetVak(); return; }
    prop(0, () => { reset(); zetVak(); }, afgescheurd);
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

  /* Afscheuren met het toetsenbord: trekken kan enkel met muis of vinger, dus
     zodra het bonnetje geprint is en de bewaarknop focus heeft, scheuren de
     pijltjes het af (links, rechts: opzij; omhoog: naar boven), net als Delete
     en Escape. Zo kan ook wie met toetsen werkt opnieuw printen. */
  bewaarKnop.setAttribute("aria-keyshortcuts", "ArrowUp ArrowLeft ArrowRight Delete Escape");
  bewaarKnop.addEventListener("keydown", (e) => {
    if (!geprint || bezig || sleep.actief) return;
    const k = e.key;
    if (k === "ArrowLeft" || k === "ArrowRight") { e.preventDefault(); sleep.hoek = 0; scheurOpzij(k === "ArrowLeft" ? -1 : 1); }
    else if (k === "ArrowUp" || k === "Delete" || k === "Escape" || k === "Backspace") { e.preventDefault(); scheurOmhoog(); }
  });

  // bij een taalwissel staat het bonnetje er in de vorige taal: opnieuw tekenen
  addEventListener("cv-layout", () => {
    loaderTeksten();
    if (schuif.dataset.staat === "bewaar") { bewaarTxt.textContent = sjabloon("bewaar"); schuif.style.setProperty("--w", bewaarBreedte() + "px"); }
    if (geprint && !bezig) { maak(); zetVak(); }
  });
  // het lettertype van het bonnetje alvast ophalen
  if (document.fonts && document.fonts.load) document.fonts.load('400 11px "IBM Plex Mono"');
})();
