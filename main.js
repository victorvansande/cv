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

  /* ---- Skill bars & language rings fill on view ---- */
  const fillIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      if (el.classList.contains("bar")) {
        el.querySelector("i").style.width = el.dataset.val + "%";
      } else if (el.classList.contains("ring")) {
        el.style.setProperty("--p", el.dataset.val);
      }
      fillIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".bar, .ring").forEach((el) => fillIO.observe(el));

  /* ---- 3D tilt on cards (rAF-throttled for smoothness) ---- */
  if (window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      let raf = null, nx = 0, ny = 0;
      const apply = () => {
        raf = null;
        card.style.transform = `perspective(900px) rotateY(${nx * 7}deg) rotateX(${-ny * 7}deg) translateY(-4px)`;
      };
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        nx = (e.clientX - r.left) / r.width - 0.5;
        ny = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      card.addEventListener("mouseleave", () => {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = "";
      });
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

  /* ---- Contact form (mailto) ---- */
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = encodeURIComponent(fd.get("name") || "");
      const msg = encodeURIComponent(fd.get("message") || "");
      const subject = encodeURIComponent(`Bericht via portfolio: ${fd.get("name") || ""}`);
      window.location.href =
        `mailto:victorvansande@gmail.com?subject=${subject}&body=${msg}%0D%0A%0D%0AGroeten,%0D%0A${name}`;
      const btn = form.querySelector("button[type=submit]");
      if (btn) { btn.textContent = "Mailclient geopend ✓"; }
    });
  }

  /* ---- Footer year ---- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---- Theme switcher ---- */
  const THEMES = ["indigo", "teal", "emerald", "amber", "rose", "slate", "violet"];
  const applyTheme = (t) => {
    if (!THEMES.includes(t)) t = "indigo";
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
    applyTheme(saved || document.documentElement.dataset.theme || "indigo");
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
