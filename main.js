/* ============================================================
   Victor Van Sande - CV website  ·  interactions
   ============================================================ */
(() => {
  "use strict";

  /* ---- Cursor glow (desktop only) ---- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    let x = 0, y = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", (e) => {
      tx = e.clientX; ty = e.clientY; glow.style.opacity = "1";
    });
    const loop = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      glow.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---- Nav scrolled state ---- */
  const navEl = document.querySelector(".nav");
  if (navEl) {
    const syncNav = () => navEl.classList.toggle("scrolled", window.scrollY > 48);
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
      a.addEventListener("click", () => links.classList.remove("open")));
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
      const dur = 1400; const start = performance.now();
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

  /* ---- Skill / language bars fill on view ---- */
  const fillIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.querySelector("i").style.width = el.dataset.val + "%";
      fillIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".bar").forEach((el) => fillIO.observe(el));

  /* ---- Cursor spotlight on cards (rAF-throttled, GPU-cheap) ---- */
  if (window.matchMedia("(pointer:fine)").matches) {
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

  /* ---- Hero role rotator ---- */
  const rot = document.querySelector("[data-rotate]");
  if (rot) {
    const words = JSON.parse(rot.dataset.rotate);
    let i = 0;
    const swap = () => {
      rot.style.opacity = "0"; rot.style.transform = "translateY(8px)";
      setTimeout(() => {
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.style.opacity = "1"; rot.style.transform = "none";
      }, 360);
    };
    setInterval(swap, 2600);
  }

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

  /* ---- Footer year ---- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Theme switcher ---- */
  const THEMES = ["indigo", "teal", "emerald", "amber", "rose", "slate", "violet"];
  const applyTheme = (t) => {
    if (!THEMES.includes(t)) t = "rose";
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("cv-theme", t); } catch (e) {}
    document.querySelectorAll(".swatch").forEach((s) =>
      s.classList.toggle("active", s.dataset.theme === t));
  };
  const tBtn = document.querySelector(".theme-toggle");
  const tPop = document.querySelector(".theme-pop");
  if (tBtn && tPop) {
    tBtn.addEventListener("click", (e) => { e.stopPropagation(); tPop.classList.toggle("open"); });
    tPop.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => tPop.classList.remove("open"));
    document.querySelectorAll(".swatch").forEach((s) =>
      s.addEventListener("click", () => { applyTheme(s.dataset.theme); }));
    const saved = (() => { try { return localStorage.getItem("cv-theme"); } catch (e) { return null; } })();
    applyTheme(saved || document.documentElement.dataset.theme || "rose");
  }

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
    setMode(savedMode || document.documentElement.dataset.mode || "dark");
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
      if (toTop) toTop.classList.toggle("show", h.scrollTop > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---- Scroll-spy (single-page section indicator) ---- */
  const secs = [...document.querySelectorAll(".sec[id]")];
  if (secs.length) {
    const links = [...document.querySelectorAll('.nav-links a[href^="#"], .dot-nav a[href^="#"]')];
    const setActive = (id) => links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === "#" + id));
    let current = "";
    const spy = new IntersectionObserver((entries) => {
      // pick the entry whose top is closest to the offset line and is intersecting
      let best = null;
      entries.forEach((e) => {
        if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
      });
      if (best && best.target.id !== current) { current = best.target.id; setActive(current); }
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
})();
