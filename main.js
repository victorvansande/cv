/* ============================================================
   Victor Van Sande - CV website  ·  interactions
   ============================================================ */
(() => {
  "use strict";

  const finePointer = window.matchMedia("(pointer:fine)").matches;
  let glowKick = null;

  /* ---- Custom cursor + glow (desktop / fine pointer only) ---- */
  const glow = document.querySelector(".cursor-glow");
  if (finePointer) {
    const dot = document.createElement("div");
    dot.className = "cursor-dot is-off"; dot.setAttribute("aria-hidden", "true");
    const halo = document.createElement("div");
    halo.className = "cursor-halo is-off"; halo.setAttribute("aria-hidden", "true");
    document.body.append(dot, halo);
    document.documentElement.classList.add("has-custom-cursor");

    const interactive = "a, button, label, .swatch, .settings-toggle, .burger, [role='button'], .diploma-thumb, .thesis-teaser";
    let gx = 0, gy = 0, tx = 0, ty = 0, shown = false;

    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY;
      const pos = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
      dot.style.transform = pos;
      halo.style.transform = pos;
      halo.classList.toggle("is-hover", !!e.target.closest(interactive));
      if (!shown) { shown = true; dot.classList.remove("is-off"); halo.classList.remove("is-off"); }
      if (glow) glow.style.opacity = "1";
      if (glowKick) glowKick();
    });
    document.addEventListener("mousedown", () => halo.classList.add("is-down"));
    document.addEventListener("mouseup", () => halo.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => {
      dot.classList.add("is-off"); halo.classList.add("is-off"); if (glow) glow.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => { dot.classList.remove("is-off"); halo.classList.remove("is-off"); });

    if (glow) {
      /* De gloed loopt de cursor achterna. Vroeger draaide deze lus onafgebroken
         vanaf het laden - elke frame een stijlschrijfbeurt, ook als de muis
         nooit bewoog. Dat kostte de intro frames. Nu stopt de lus zodra de
         gloed de cursor heeft ingehaald; een muisbeweging start hem weer. */
      let raf = null;
      const loop = () => {
        gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
        glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
        if (Math.abs(tx - gx) < 0.4 && Math.abs(ty - gy) < 0.4) { raf = null; return; }
        raf = requestAnimationFrame(loop);
      };
      glowKick = () => { if (raf === null) raf = requestAnimationFrame(loop); };
    }
  }

  /* ---- Nav scrolled state + auto-hide bij scroll-richting ---- */
  const navEl = document.querySelector(".nav");
  if (navEl) {
    let lastY = window.scrollY;
    const syncNav = () => {
      const y = window.scrollY;
      navEl.classList.toggle("scrolled", y > 48);
      const menuOpen = navEl.querySelector(".nav-links.open");
      // verbergen bij naar beneden scrollen voorbij de balk; tonen bij omhoog of bovenaan
      if (!menuOpen && y > 120 && y > lastY + 4) {
        navEl.classList.add("nav-hidden");
      } else if (y < lastY - 4 || y <= 120) {
        navEl.classList.remove("nav-hidden");
      }
      lastY = y;
    };
    window.addEventListener("scroll", syncNav, { passive: true });
    syncNav();
  }

  /* ---- Mobile nav ---- */
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      links.classList.toggle("open");
      burger.classList.toggle("on");
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => { links.classList.remove("open"); burger.classList.remove("on"); }));
  }

  /* ---- Prisma-intro: de naamlagen klonen uit de echte h1 ----
     De h1 gebruikt `text-wrap: balance`, die de regels verdeelt over de hele
     kop ("Hallo, ik ben" + de naam). Een kopie die alleen de naam bevat komt
     daardoor op een andere regelval uit — vandaar dat er eerder een tweede
     "Sande" op een eigen regel kon belanden. Door de volledige h1 te klonen en
     daarin alles behalve de naam onzichtbaar te zetten, is de zetting per
     definitie identiek: zelfde inhoud, zelfde breedte, zelfde balancering. */
  if (document.documentElement.classList.contains("intro")) {
    const veil = document.querySelector(".intro-veil");
    const stage = veil && veil.querySelector(".intro-stage");
    const host = document.querySelector(".prism-host");
    const real = host && host.querySelector(".grad-text");
    if (veil && stage && host && real) {
      const copies = ["in-b3", "in-b1", "in-b0"].map((cls) => {
        const clone = host.cloneNode(true);
        clone.classList.add("in-l", cls);
        clone.removeAttribute("id");
        // i18n moet de klonen negeren: ze leven maar een paar seconden
        clone.querySelectorAll("[data-i18n]").forEach((el) => el.removeAttribute("data-i18n"));
        // alles behalve de naam onzichtbaar, maar wel ruimte latend innemen
        clone.querySelectorAll(":scope > *:not(.grad-text)").forEach((el) => el.classList.add("intro-hidden"));
        stage.appendChild(clone);
        return clone;
      });
      let last = "";
      const place = () => {
        const h = host.getBoundingClientRect();
        const r = real.getBoundingClientRect();
        const key = h.left + "|" + h.top + "|" + h.width + "|" + r.top + "|" + r.height;
        if (key === last) return;
        last = key;
        // de klonen liggen op de h1 zelf, niet op de naam: zo klopt de regelval
        stage.style.left = h.left + "px";
        stage.style.top = h.top + "px";
        stage.style.width = h.width + "px";
        stage.style.height = h.height + "px";
        copies.forEach((c) => { c.style.width = h.width + "px"; });
        // explosie en lichtspill centreren op het midden van de naam
        veil.style.setProperty("--nx", r.left + r.width / 2 + "px");
        veil.style.setProperty("--ny", r.top + r.height / 2 + "px");
      };
      /* De echte naam beweegt vooral in het begin: de hero-kaart schuift omhoog
         (.reveal, 0.8s) en het webfont kan later binnenkomen. Daarvoor volgen we
         elk frame. Elke meting dwingt de browser tot een layout-herberekening,
         dus dat doen we enkel zolang er nog iets kan schuiven; daarna volstaan
         scroll- en resize-events, die alleen vuren als er echt iets verandert. */
      let tracking = true, live = true;
      const track = () => { if (!tracking) return; place(); requestAnimationFrame(track); };
      place();
      requestAnimationFrame(track);
      setTimeout(() => { tracking = false; }, 1800);
      const onMove = () => { if (live) place(); };
      addEventListener("scroll", onMove, { passive: true });
      addEventListener("resize", onMove, { passive: true });
      /* rAF ligt stil in een achtergrondtab; deze hermetingen vuren wél en vangen
         het uitklappen van de hero-kaart en het laden van het webfont op, zodat
         de laag ook dan exact blijft liggen. */
      [80, 260, 520, 900, 1400].forEach((ms) => setTimeout(place, ms));

      /* De startpoort openen. Wachten op het webfont is niet alleen netjes voor
         de uitlijning: als het lettertype halverwege binnenkomt, moeten de drie
         vervaagde naamlagen opnieuw gerasterd worden, en dat is midden in de
         animatie goed zichtbaar. De twee frames erna geven de browser de kans
         het eerste beeld rustig neer te zetten. Het scherm is zwart, dus dit
         wachten kost visueel niets - maar er zit een dop op, zodat een traag
         lettertype de intro nooit tegenhoudt. */
      const ready = Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 900)),
      ]);
      ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => {
        place();
        document.documentElement.classList.add("go");
      })));

      const done = () => {
        tracking = false;
        live = false;
        removeEventListener("scroll", onMove);
        removeEventListener("resize", onMove);
        veil.remove();
        /* Ook de klassen weg: anders houdt de pauzeregel de echte naam
           verborgen als de poort door een fout nooit geopend zou zijn. */
        document.documentElement.classList.remove("intro", "go");
      };
      veil.addEventListener("animationend", (e) => { if (e.animationName === "intro-end") done(); });
      /* Vangnet, zodat de laag nooit blijft hangen als animationend uitblijft.
         De teller start pas als de pagina zichtbaar is: in een achtergrondtab
         bevriest de browser de animatie, en dan mag de intro niet al weggegooid
         zijn tegen dat de bezoeker gaat kijken. */
      const arm = () => setTimeout(done, 7000);
      if (document.visibilityState === "visible") arm();
      else {
        document.addEventListener("visibilitychange", function onVis() {
          if (document.visibilityState !== "visible") return;
          document.removeEventListener("visibilitychange", onVis);
          arm();
        });
      }
    }
  }

  /* ---- Klik op de naam: de letters stralen kleur uit ----
     Niet één bloei uit een middelpunt, maar drie kopieën van de naam zelf met
     elk een vaste blur. Ze schalen op en vloeien weg, dus de gloed heeft in de
     eerste frames precies de vorm van de glyphs en diffundeert daarna pas.
     De blur staat vast en enkel transform/opacity animeren, zodat elke laag
     één keer gerasterd wordt en daarna alleen nog gecomposit.
     De h1 wordt in zijn geheel gekloond: alleen zo valt de regelval (die door
     text-wrap: balance bepaald wordt) gegarandeerd identiek uit. */
  const glowHost = document.querySelector(".prism-host");
  const glowName = glowHost && glowHost.querySelector(".grad-text");
  if (glowName && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let current = null;
    glowName.addEventListener("click", () => {
      if (document.documentElement.dataset.motion === "reduce") return;
      // hoogstens één gloed tegelijk: snel achter elkaar klikken stapelt niet op
      if (current) current.remove();
      const h = glowHost.getBoundingClientRect();
      const wrap = document.createElement("div");
      wrap.className = "name-glow";
      wrap.setAttribute("aria-hidden", "true");
      wrap.style.left = h.left + "px";
      wrap.style.top = h.top + "px";
      wrap.style.width = h.width + "px";
      wrap.style.height = h.height + "px";
      ["gl-near", "gl-mid", "gl-far"].forEach((cls) => {
        const clone = glowHost.cloneNode(true);
        clone.classList.remove("prism-host");   // anders erft de kloon de hover-regels
        clone.classList.add("gl", cls);
        clone.removeAttribute("id");
        clone.querySelectorAll("[data-i18n]").forEach((el) => el.removeAttribute("data-i18n"));
        clone.querySelectorAll(":scope > *:not(.grad-text)").forEach((el) => el.classList.add("intro-hidden"));
        clone.style.width = h.width + "px";
        wrap.appendChild(clone);
      });
      document.body.appendChild(wrap);
      current = wrap;
      const clear = () => { if (current === wrap) current = null; wrap.remove(); };
      // animationend borrelt op vanuit de lagen; de traagste bepaalt het einde
      wrap.addEventListener("animationend", (e) => {
        if (e.target.classList.contains("gl-far")) clear();
      });
      setTimeout(clear, 4000);
    });
  }

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---- Animated number counters ---- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const dur = 2400; const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (Number.isInteger(target) ? Math.round(target * eased) : (target * eased).toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  /* ---- Language pips: één voor één inladen bij scroll-in-view ---- */
  const PIP_STAGGER = 220, PIP_FILL_MS = 500;
  const langIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const wrap = e.target;
      const level = parseInt(wrap.dataset.level, 10) || 0;
      const pips = [...wrap.querySelectorAll(".lang-pip")];
      pips.forEach((pip, i) => {
        if (i < level) setTimeout(() => pip.classList.add("filled"), i * PIP_STAGGER);
      });
      // bij een volledig gevulde balk (moedertaal/C2): sterretjes pas laten opflakkeren
      // nadat de laatste pip klaar is met vullen, als kleine beloning i.p.v. los van de balk
      if (level >= pips.length) {
        const star = wrap.closest(".lang-row")?.querySelector(".lang-star");
        if (star) {
          const doneAt = (level - 1) * PIP_STAGGER + PIP_FILL_MS;
          setTimeout(() => star.classList.add("pop-star"), doneAt);
        }
      }
      langIO.unobserve(wrap);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".lang-pips").forEach((el) => langIO.observe(el));

  /* ---- Cursor spotlight on cards (rAF-throttled, GPU-cheap) ---- */
  if (finePointer) {
    document.querySelectorAll(".tilt, .fx-card").forEach((card) => {
      let raf = null, mx = 50, my = 50;
      const apply = () => {
        raf = null;
        card.style.setProperty("--mx", mx + "%");
        card.style.setProperty("--my", my + "%");
      };
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width) * 100;
        my = ((e.clientY - r.top) / r.height) * 100;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });
    });
  }

  /* ---- Hero role rotator (language-aware) ---- */
  const rot = document.querySelector("[data-rotate]");
  if (rot) {
    const wordsNl = JSON.parse(rot.dataset.rotate);
    const wordsEn = rot.dataset.rotateEn ? JSON.parse(rot.dataset.rotateEn) : wordsNl;
    const curWords = () => (document.documentElement.lang === "en" ? wordsEn : wordsNl);
    let i = 0;

    // reserveer de breedte van het langste woord zodat de zin nooit verspringt
    const measureEl = document.createElement("span");
    measureEl.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;left:-9999px;top:-9999px;";
    document.body.appendChild(measureEl);
    const syncWidth = () => {
      const cs = getComputedStyle(rot);
      measureEl.style.font = cs.font;
      measureEl.style.letterSpacing = cs.letterSpacing;
      let max = 0;
      curWords().forEach((w) => { measureEl.textContent = w; max = Math.max(max, measureEl.getBoundingClientRect().width); });
      rot.style.minWidth = Math.ceil(max) + "px";
    };

    const swap = () => {
      rot.style.opacity = "0"; rot.style.transform = "translateY(8px)";
      setTimeout(() => {
        const w = curWords();
        i = (i + 1) % w.length;
        rot.textContent = w[i];
        rot.style.opacity = "1"; rot.style.transform = "none";
      }, 360);
    };
    window.__syncRotator = () => { const w = curWords(); rot.textContent = w[i % w.length]; syncWidth(); };
    syncWidth();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncWidth);
    let resizeTimer;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(syncWidth, 150); }, { passive: true });
    setInterval(swap, 2600);
  }

  /* ---- Tag/chip-rijen: vooruitkijkend opvullen i.p.v. simpelweg links-naar-rechts
     omslaan, zodat er zo weinig mogelijk restruimte overblijft op elke regel.
     flex-wrap zelf kijkt niet vooruit; hier wel, via flex `order` zodat de
     onderliggende DOM/leesvolgorde intact blijft. `pinFirst` items (bv. een label)
     staan altijd vooraan vast en schuiven nooit mee. ---- */
  const packFlexWrap = (wrap, pinFirst = 0) => {
    const all = [...wrap.children];
    if (all.length - pinFirst < 2) return;
    const containerWidth = wrap.clientWidth;
    const gap = parseFloat(getComputedStyle(wrap).columnGap) || 0;
    const allWidths = all.map((el) => el.getBoundingClientRect().width);
    let remaining = containerWidth, firstInRow = true;
    for (let i = 0; i < pinFirst; i++) {
      all[i].style.order = i;
      remaining -= allWidths[i] + (firstInRow ? 0 : gap);
      firstInRow = false;
    }
    const items = all.slice(pinFirst);
    const widths = allWidths.slice(pinFirst);
    const used = new Array(items.length).fill(false);
    const order = [];
    let placed = 0;
    while (placed < items.length) {
      const earliest = used.indexOf(false);
      const firstNeeded = widths[earliest] + (firstInRow ? 0 : gap);
      let pick = firstNeeded <= remaining + 0.5 ? earliest : -1;
      if (pick === -1) {
        for (let i = earliest + 1; i < items.length; i++) {
          if (used[i]) continue;
          if (widths[i] + gap <= remaining + 0.5) { pick = i; break; }
        }
      }
      if (pick === -1) {
        if (firstInRow) { pick = earliest; } // item zelf breder dan de rij: forceer plaatsen, geen oneindige lus
        else { remaining = containerWidth; firstInRow = true; continue; }
      }
      used[pick] = true; order.push(pick);
      remaining -= widths[pick] + (firstInRow ? 0 : gap);
      firstInRow = false; placed++;
    }
    order.forEach((origIdx, visualPos) => { items[origIdx].style.order = pinFirst + visualPos; });
  };
  const packSkillTags = () => {
    document.querySelectorAll(".skill-tags").forEach((wrap) => packFlexWrap(wrap, 0));
    document.querySelectorAll(".personal-strip").forEach((wrap) => packFlexWrap(wrap, 1));
  };
  packSkillTags();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(packSkillTags);
  let tagsResizeTimer;
  window.addEventListener("resize", () => { clearTimeout(tagsResizeTimer); tagsResizeTimer = setTimeout(packSkillTags, 150); }, { passive: true });

  /* ---- Language switch (NL / EN) ---- */
  const I18N = (window.I18N && window.I18N.en) || {};
  const langBtn = document.querySelector(".lang-toggle");
  const i18nEls = [...document.querySelectorAll("[data-i18n]")];
  i18nEls.forEach((el) => { el.dataset.nlHtml = el.innerHTML; });
  const applyLang = (lang) => {
    const en = lang === "en";
    document.documentElement.lang = en ? "en" : "nl";
    i18nEls.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = (en && I18N[key] != null) ? I18N[key] : el.dataset.nlHtml;
    });
    try { localStorage.setItem("cv-lang", lang); } catch (e) {}
    if (langBtn) langBtn.setAttribute("aria-label", en ? "Schakel naar Nederlands · Switch to Dutch" : "Switch to English · Schakel naar Engels");
    if (window.__syncRotator) window.__syncRotator();
    packSkillTags();
  };
  if (langBtn) langBtn.addEventListener("click", () =>
    applyLang(document.documentElement.lang === "en" ? "nl" : "en"));
  const savedLang = (() => { try { return localStorage.getItem("cv-lang"); } catch (e) { return null; } })();
  applyLang(savedLang === "en" ? "en" : "nl");

  /* ---- Glim: fire only on mouseenter, not on mouseleave ---- */
  document.querySelectorAll(".chip, .skill-tag").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      el.classList.remove("glim");
      void el.offsetWidth; // reflow to restart animation
      el.classList.add("glim");
    });
    el.addEventListener("animationend", () => el.classList.remove("glim"), { passive: true });
  });

  /* ---- Footer quote rotator ---- */
  const QUOTES = [
    { q: "The medium is the message.", a: "Marshall McLuhan" },
    { q: "One cannot not communicate.", a: "Paul Watzlawick" },
    { q: "Comment is free, but facts are sacred.", a: "C.P. Scott" },
    { q: "Design is not just what it looks like and feels like. Design is how it works.", a: "Steve Jobs" },
    { q: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", a: "Albert Einstein" },
    { q: "Good design is as little design as possible.", a: "Dieter Rams" },
    { q: "The curious paradox is that when I accept myself just as I am, then I can change.", a: "Carl Rogers" },
    { q: "In the beginner's mind there are many possibilities, but in the expert's mind there are few.", a: "Shunryu Suzuki" },
    { q: "The great enemy of clear language is insincerity.", a: "George Orwell" },
    { q: "Who looks outside, dreams; who looks inside, awakes.", a: "Carl Gustav Jung" },
    { q: "The trouble with the world is that the stupid are cocksure and the intelligent are full of doubt.", a: "Bertrand Russell" },
    { q: "We are now a culture whose information, ideas, and epistemology are given form by television, not by the printed word.", a: "Neil Postman" },
    { q: "There can be no liberty for a community which lacks the information by which to detect lies.", a: "Walter Lippmann" },
    { q: "In any given moment we have two options: to step forward into growth or to step back into safety.", a: "Abraham Maslow" },
    { q: "The goal of education is not to increase the amount of knowledge but to create the possibilities for a child to invent and discover.", a: "Jean Piaget" },
    { q: "We tell ourselves stories in order to live.", a: "Joan Didion" },
    { q: "Design is the silent ambassador of your brand.", a: "Paul Rand" },
    { q: "Nothing in life is as important as you think it is, while you are thinking about it.", a: "Daniel Kahneman" },
    { q: "The reasonable man adapts himself to the world; the unreasonable one persists in trying to adapt the world to himself. Therefore all progress depends on the unreasonable man.", a: "George Bernard Shaw" },
    { q: "Information is the resolution of uncertainty.", a: "Claude Shannon" },
    { q: "The privilege of a lifetime is being who you are.", a: "Joseph Campbell" },
    { q: "The limits of my language mean the limits of my world.", a: "Ludwig Wittgenstein" },
    { q: "A leader is best when people barely know he exists.", a: "Lao Tzu" },
    { q: "All of us who professionally use the mass media are the shapers of society. We can vulgarise that society. We can brutalise it. Or we can help lift it onto a higher level.", a: "William Bernbach" },
    { q: "Leadership and learning are indispensable to each other.", a: "John F. Kennedy" },
    { q: "Make it simple. Make it memorable. Make it inviting to look at. Make it fun to read.", a: "Leo Burnett" },
    { q: "Either you repeat the same conventional doctrines everybody is saying, or else you say something true, and it will sound like it's from Neptune.", a: "Noam Chomsky" },
    { q: "Just because your voice reaches halfway around the world doesn't mean you are wiser than when it reached only to the end of the bar.", a: "Edward R. Murrow" },
    { q: "Facts do not cease to exist because they are ignored.", a: "Aldous Huxley" },
    { q: "The greatest obstacle to discovery is not ignorance — it is the illusion of knowledge.", a: "Daniel J. Boorstin" },
    { q: "The map is not the territory.", a: "Alfred Korzybski" },
    { q: "Half the money I spend on advertising is wasted; the trouble is I don't know which half.", a: "John Wanamaker" },
    { q: "There is nothing more deceptive than an obvious fact.", a: "Arthur Conan Doyle" },
    { q: "Those who cannot remember the past are condemned to repeat it.", a: "George Santayana" },
    { q: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.", a: "Viktor Frankl" },
    { q: "Creativity is just connecting things.", a: "Steve Jobs" },
    { q: "Simplicity is not the goal. It is the by-product of a good idea and modest expectations.", a: "Paul Rand" },
    { q: "A language is a dialect with an army and a navy.", a: "Max Weinreich" },
    { q: "In advertising, not to be different is virtually suicidal.", a: "William Bernbach" },
    { q: "The most powerful element in advertising is the truth.", a: "William Bernbach" },
    { q: "We shape our tools and thereafter our tools shape us.", a: "John M. Culkin" },
    { q: "The single biggest problem in communication is the illusion that it has taken place.", a: "George Bernard Shaw" },
    { q: "Without data, you're just another person with an opinion.", a: "W. Edwards Deming" },
    { q: "A picture is worth a thousand words, but only if you know the thousand words.", a: "Umberto Eco" },
    { q: "The function of education is to teach one to think intensively and to think critically. Intelligence plus character — that is the goal of true education.", a: "Martin Luther King Jr." },
    { q: "The most important thing in communication is hearing what isn't said.", a: "Peter Drucker" },
    { q: "We do not see things as they are, we see them as we are.", a: "Anaïs Nin" },
  ];

  const qWrap = document.querySelector(".footer-quote");
  const qText = document.getElementById("quoteText");
  const qAuth = document.getElementById("quoteAuthor");
  if (qWrap && qText && qAuth) {
    const shuffled = [...QUOTES].sort(() => Math.random() - 0.5);
    let qi = 0;
    const show = ({ q, a }) => { qText.textContent = q; qAuth.textContent = "— " + a; };
    const rotate = () => {
      qWrap.classList.add("fading");
      setTimeout(() => {
        qi = (qi + 1) % shuffled.length;
        show(shuffled[qi]);
        qWrap.classList.remove("fading");
      }, 420);
    };
    show(shuffled[qi]);
    setInterval(rotate, 3 * 60 * 1000);
  }

  /* ---- Settings menu (mode · language · theme · accessibility in one popover) ---- */
  const setBtn = document.querySelector(".settings-toggle");
  const setPop = document.querySelector(".settings-pop");
  if (setBtn && setPop) {
    const closePop = () => { setPop.classList.remove("open"); setBtn.setAttribute("aria-expanded", "false"); };
    setBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = setPop.classList.toggle("open");
      setBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    setPop.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", closePop);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); });
  }

  /* ---- Colour theme ---- */
  const THEMES = ["indigo", "teal", "emerald", "amber", "rose", "slate", "violet"];
  const applyTheme = (t) => {
    if (!THEMES.includes(t)) t = "rose";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("cv-theme", t); } catch (e) {}
    document.querySelectorAll(".swatch").forEach((s) =>
      s.classList.toggle("active", s.dataset.theme === t));
  };
  document.querySelectorAll(".swatch").forEach((s) =>
    s.addEventListener("click", () => applyTheme(s.dataset.theme)));
  applyTheme((() => { try { return localStorage.getItem("cv-theme"); } catch (e) { return null; } })()
    || document.documentElement.dataset.theme || "rose");

  /* ---- Light / dark mode ---- */
  const mBtn = document.querySelector(".mode-toggle");
  if (mBtn) {
    const setMode = (m) => {
      document.documentElement.dataset.mode = m;
      try { localStorage.setItem("cv-mode", m); } catch (e) {}
      mBtn.setAttribute("aria-label", m === "light" ? "Schakel naar donkere modus" : "Schakel naar lichte modus");
    };
    mBtn.addEventListener("click", () =>
      setMode(document.documentElement.dataset.mode === "light" ? "dark" : "light"));
    const savedMode = (() => { try { return localStorage.getItem("cv-mode"); } catch (e) { return null; } })();
    setMode(savedMode || document.documentElement.dataset.mode || "light");
  }

  /* ---- Accessibility preferences (reduce motion / high contrast) ---- */
  const motionCb = document.querySelector(".a11y-motion");
  const contrastCb = document.querySelector(".a11y-contrast");
  if (motionCb && contrastCb) {
    const getLS = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
    const applyMotion = (on) => {
      if (on) document.documentElement.dataset.motion = "reduce";
      else document.documentElement.removeAttribute("data-motion");
      motionCb.checked = on;
    };
    const applyContrast = (on) => {
      if (on) document.documentElement.dataset.contrast = "high";
      else document.documentElement.removeAttribute("data-contrast");
      contrastCb.checked = on;
    };
    applyMotion(getLS("cv-motion") === "reduce");
    applyContrast(getLS("cv-contrast") === "high");
    motionCb.addEventListener("change", () => {
      applyMotion(motionCb.checked);
      setLS("cv-motion", motionCb.checked ? "reduce" : "no");
    });
    contrastCb.addEventListener("change", () => {
      applyContrast(contrastCb.checked);
      setLS("cv-contrast", contrastCb.checked ? "high" : "no");
    });
  }

  /* ---- Scroll progress bar + back to top ---- */
  const prog = document.querySelector(".progress-bar");
  const toTop = document.querySelector(".to-top");
  if (prog || toTop) {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      if (prog) prog.style.width = p + "%";
      // dicht bij de footer: knop verbergen zodat hij nooit over de social-icons valt
      const distToBottom = h.scrollHeight - (h.scrollTop + h.clientHeight);
      if (toTop) toTop.classList.toggle("show", h.scrollTop > 600 && distToBottom > 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---- Scroll-spy (single-page section indicator) ---- */
  const secs = [...document.querySelectorAll(".sec[id]")];
  if (secs.length) {
    const links = [...document.querySelectorAll('.nav-links a[href^="#"], .dot-nav a[href^="#"]')];
    const dotLinks = [...document.querySelectorAll('.dot-nav a[href^="#"]')];
    const setActive = (id) => links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + id));
    // sectienaam enkele seconden uit het bolletje laten poppen
    let popTimer;
    const popLabel = (id) => {
      const dot = dotLinks.find((a) => a.getAttribute("href") === "#" + id);
      if (!dot) return;
      dotLinks.forEach((a) => a.classList.remove("spy-pop"));
      void dot.offsetWidth; // reflow → animatie/overgang opnieuw starten
      dot.classList.add("spy-pop");
      clearTimeout(popTimer);
      popTimer = setTimeout(() => dot.classList.remove("spy-pop"), 2200);
    };
    let current = "";
    const spy = new IntersectionObserver((entries) => {
      // pick the entry whose top is closest to the offset line and is intersecting
      let best = null;
      entries.forEach((e) => {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
      });
      if (best && best.target.id !== current) {
        const first = current === "";
        current = best.target.id;
        setActive(current);
        if (!first) popLabel(current); // niet poppen bij de eerste meting op laadmoment
      }
    }, { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] });
    secs.forEach((s) => spy.observe(s));
  }

  /* ---- Diploma lightbox ---- */
  const lb = document.querySelector(".lightbox");
  if (lb) {
    const lbImg = lb.querySelector("img");
    const open = (src, alt) => { lbImg.src = src; lbImg.alt = alt || ""; lb.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
    document.querySelectorAll(".diploma-thumb").forEach((t) =>
      t.addEventListener("click", () => open(t.dataset.full || t.querySelector("img").src, t.querySelector("img").alt)));
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lightbox-close")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ---- Inklapbare kaarten (TL;DR, ontwerpwerk-luikje, ...): dichtgeklapt tot geopend ---- */
  const accordionSetters = new Map();
  document.querySelectorAll(".tldr-card").forEach((card) => {
    const toggle = card.querySelector(".tldr-toggle");
    const panel = card.querySelector(".tldr-panel");
    if (!toggle || !panel) return;
    const setOpen = (open) => {
      card.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      panel.toggleAttribute("inert", !open);
    };
    toggle.addEventListener("click", () => setOpen(!card.classList.contains("open")));
    accordionSetters.set(card, setOpen);
  });
  // de sprong-link in de hero moet de TL;DR-kaart meteen openklappen, anders land je op een dichte kaart
  const tldrCard = document.querySelector("#tldr .tldr-card");
  const tldrNudge = document.querySelector(".tldr-nudge");
  if (tldrCard && tldrNudge) {
    const setTldrOpen = accordionSetters.get(tldrCard);
    if (setTldrOpen) tldrNudge.addEventListener("click", () => setTldrOpen(true));
  }

})();
