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
  const printKnop = blok.querySelector(".snap-print");
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
        // streepjescode uit de tekens van de link: telkens dezelfde voor dezelfde link
        if (teken) {
          ctx.fillStyle = INKT;
          let x = PAD + 10; const eind = B - PAD - 10;
          let i = 0;
          while (x < eind) {
            const c = g.s.charCodeAt(i % g.s.length) + i * 7;
            const w = 1 + (c % 3), gat = 1 + ((c >> 2) % 3);
            ctx.fillRect(x, y + 4, w, 38);
            x += w + gat; i++;
          }
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
    printKnop.disabled = true;
    // eerst het lettertype van het bonnetje, anders tekent het canvas in een vervanglettertype
    const lt = document.fonts && document.fonts.load ? document.fonts.load('400 11px "IBM Plex Mono"').catch(() => {}) : Promise.resolve();
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
      printKnop.disabled = false;
      printKnop.classList.add("bewaren");
      label(printKnop, sjabloon("bewaar"));
      if (hint) hint.hidden = false;
    };
    if (rustig()) { zetHoogte(hoogte); klaar(); return; }
    // het papier komt gelijkmatig naar buiten, met een zachte aanloop en uitloop
    const duur = Math.max(1600, hoogte * 4.2), t0 = performance.now();
    const glad = (t) => t * t * (3 - 2 * t);
    const stap = (nu) => {
      const p = Math.min(1, (nu - t0) / duur);
      zetHoogte(glad(p) * hoogte);
      if (p < 1) requestAnimationFrame(stap); else klaar();
    };
    requestAnimationFrame(stap);
  };
  /* ---- Bel-knoppen (eigen bouw naar de Bell Toggle van React Bits) ----
     Bij een klik "belt" het pictogram met twee geluidsgolfjes, vloeit het
     label over in het nieuwe, en schuift de knop mee naar de nieuwe breedte:
     de oude breedte wordt vastgezet, het label gewisseld, de nieuwe breedte
     gemeten, en daartussen loopt een overgang. */
  const bel = (knop) => {
    if (rustig()) return;
    knop.classList.remove("belt"); void knop.offsetWidth; knop.classList.add("belt");
  };
  const label = (knop, tekst) => {
    const t = knop.querySelector(".bel-txt");
    if (!t || t.textContent === tekst) return;
    if (rustig()) { t.textContent = tekst; return; }
    const oud = knop.getBoundingClientRect().width;
    knop.style.width = oud + "px";
    t.classList.add("weg");
    setTimeout(() => {
      t.textContent = tekst;
      knop.style.width = "auto";
      const nieuw = knop.getBoundingClientRect().width;
      knop.style.width = oud + "px";
      void knop.offsetWidth;
      knop.style.width = nieuw + "px";
      t.classList.remove("weg");
      setTimeout(() => { knop.style.width = ""; }, 380);
    }, 160);
  };
  /* Eén knop: zolang er geen bonnetje uit de printer hangt, print hij er een;
     daarna bewaart hij het als afbeelding. Wie het bonnetje afscheurt, krijgt
     weer de printknop. */
  printKnop.addEventListener("animationend", (e) => { if (e.animationName === "bel-ring") printKnop.classList.remove("belt"); });
  printKnop.addEventListener("click", () => {
    if (bezig) return;
    bel(printKnop);
    if (geprint) { bewaar(); return; }
    label(printKnop, sjabloon("bezig"));
    print();
  });
  printKnop.querySelector(".bel-txt").textContent = sjabloon("print");

  let bewaardTimer = null;
  const bewaar = () => {
    label(printKnop, sjabloon("bewaard"));
    clearTimeout(bewaardTimer);
    bewaardTimer = setTimeout(() => { if (geprint) label(printKnop, sjabloon("bewaar")); }, 1800);
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
    printKnop.classList.remove("bewaren");
    if (hint) hint.hidden = true;
    label(printKnop, sjabloon("print"));
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
    printKnop.querySelector(".bel-txt").textContent = sjabloon(bezig ? "bezig" : (geprint ? "bewaar" : "print"));
    if (geprint && !bezig) { maak(); zetVak(); }
  });
  // het lettertype van het bonnetje alvast ophalen
  if (document.fonts && document.fonts.load) document.fonts.load('400 11px "IBM Plex Mono"');
})();
