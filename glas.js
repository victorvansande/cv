/* Glaslens als cursor boven de grote foto's.
   Zodra de muis over een grote foto (.frame img) komt, groeit de cursor uit
   tot een lens van vloeibaar glas die de foto eronder breekt; bij het verlaten
   krimpt hij terug tot een punt en is de gewone cursor er weer.
   Naar de Liquid Glass van Aceternity UI, omgezet van React en Tailwind naar
   gewone javascript, want deze site heeft geen bouwstap. De wiskunde (een
   verplaatsingskaart volgens de wet van Snellius, als SVG-filter in een
   backdrop-filter) is overgenomen; Chromium breekt het licht echt, Safari en
   Firefox kennen geen url() in backdrop-filter en krijgen mat glas.
   Enkel met een muis (hover en een fijne aanwijzer), niet op touch. */
(() => {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-transparency: reduce)").matches) return;

  const MAAT = 132;          // diameter van de lens in px
  const OPT = { scale: 48, aberration: 14, bevelDepth: 37, frost: 0.4, tint: 0.12 };
  const root = document.documentElement;
  const rustig = () => matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.motion === "reduce";

  const ua = navigator.userAgent;
  const safari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR/.test(ua);
  const breekt = !safari && window.CSS && (CSS.supports("backdrop-filter", "url(#x)") || CSS.supports("-webkit-backdrop-filter", "url(#x)"));

  const lens = document.createElement("div");
  lens.className = "glas-lens";
  lens.setAttribute("aria-hidden", "true");
  const glas = document.createElement("div");
  glas.className = "glas-bol" + (breekt ? "" : " glas-mat");
  lens.appendChild(glas);
  document.body.appendChild(lens);
  root.classList.add("glas-ok");

  if (breekt) {
    glas.style.backgroundColor = `rgb(255 255 255 / ${OPT.tint})`;
    maakFilter().then((f) => {
      const span = document.createElement("span");
      span.className = "glas-svg";
      span.innerHTML = f.svg;
      glas.appendChild(span);
      const bf = `url(#${f.id}) blur(0.5px) saturate(1.85) brightness(1.02)`;
      glas.style.backdropFilter = bf;
      glas.style.webkitBackdropFilter = bf;
    }).catch(() => glas.classList.add("glas-mat"));
  }

  /* volgen: de lens loopt de muis zacht achterna (een vleugje traagheid
     maakt hem vloeibaar); bij minder beweging staat hij meteen op de muis */
  let mx = -999, my = -999, lx = -999, ly = -999, aan = false, loop = 0;
  const zet = () => { lens.style.transform = `translate3d(${lx - MAAT / 2}px, ${ly - MAAT / 2}px, 0)`; };
  const stap = () => {
    const k = rustig() ? 1 : 0.28;
    lx += (mx - lx) * k; ly += (my - ly) * k;
    zet();
    loop = (aan || Math.abs(mx - lx) + Math.abs(my - ly) > 0.3) ? requestAnimationFrame(stap) : 0;
  };
  const wek = () => { if (!loop) loop = requestAnimationFrame(stap); };

  const opFoto = (el) => !!(el && el.closest && el.closest(".frame img")) &&
    !root.classList.contains("vel-open") && root.dataset.view !== "compact";

  const zetAan = (v) => {
    if (v === aan) return;
    if (v && lx < -900) { lx = mx; ly = my; zet(); }   // eerste keer: niet vanuit de hoek komen aanvliegen
    aan = v;
    lens.classList.toggle("aan", v);
    root.classList.toggle("glas-actief", v);
    wek();
  };

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY;
    zetAan(opFoto(e.target));
    if (aan) wek();
  }, { passive: true });
  // bij scrollen schuift de foto onder een stilstaande muis weg
  addEventListener("scroll", () => { if (aan || mx > -900) zetAan(opFoto(document.elementFromPoint(mx, my))); }, { passive: true });
  document.addEventListener("pointerleave", () => zetAan(false));
  addEventListener("blur", () => zetAan(false));

  /* ---- verplaatsingskaart en filter (uit de bron, ongewijzigd in werking) ----
     R = horizontale buiging, G = verticale, B = glans op de rand, A = vorm.
     Neutraal grijs (128) betekent geen verplaatsing. */
  async function maakFilter() {
    const w = MAAT, h = MAAT;
    const url = await kaartUrl({ width: w, height: h, radius: MAAT / 2, bevelDepth: Math.min(OPT.bevelDepth, MAAT / 2), dpr: Math.min(devicePixelRatio || 1, 2) });
    await new Promise((r) => { const i = new Image(); i.onload = i.onerror = () => r(); i.src = url; });
    const id = "glas-" + Date.now().toString(36);
    return { id, svg: filterSvg({ id, mapUrl: url, width: w, height: h, ...OPT }) };
  }

  function sdBox(px, py, hw, hh, r) {
    const qx = Math.abs(px) - hw + r, qy = Math.abs(py) - hh + r;
    return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
  }
  function buiging(x) {
    const u = 1 - Math.min(1, Math.max(0, x));
    const n = (1 - u ** 4) ** 0.75;
    if (n < 1e-6) return 0;
    const ti = Math.atan(Math.min(u ** 3 / n, 8));
    const st = Math.sin(ti) / 1.5;
    if (st >= 1) return Math.sin(ti);
    return Math.sin(ti - Math.asin(st));
  }
  function phiTabel(b) {
    const n = Math.max(1, Math.ceil(b)), phi = new Float32Array(n + 1);
    for (let d = 1; d <= n; d++) phi[d] = phi[d - 1] + buiging(d / n);
    return phi;
  }
  function phiAt(phi, d) {
    const m = phi.length - 1;
    if (d <= 0) return phi[0];
    if (d >= m) return phi[m];
    const i = Math.floor(d), f = d - i;
    return phi[i] * (1 - f) + phi[i + 1] * f;
  }
  function kaartData(o) {
    const dpr = o.dpr || 1, gain = 1.35, L = { x: -0.55, y: -0.85 };
    const ll = Math.hypot(L.x, L.y) || 1, lx = L.x / ll, ly = L.y / ll;
    const W = Math.max(1, Math.round(o.width * dpr)), H = Math.max(1, Math.round(o.height * dpr));
    const hw = W / 2, hh = H / 2, r = Math.min(o.radius * dpr, hw, hh);
    const bevel = Math.max(1, o.bevelDepth * dpr), phi = phiTabel(bevel);
    const veld = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      const py = y - hh + 0.5;
      for (let x = 0; x < W; x++) {
        const d = sdBox(x - hw + 0.5, py, hw, hh, r);
        veld[y * W + x] = d > 0 ? 0 : phiAt(phi, Math.min(bevel, -d));
      }
    }
    const data = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      const py = y - hh + 0.5;
      for (let x = 0; x < W; x++) {
        const px = x - hw + 0.5, i = (y * W + x) << 2, d = sdBox(px, py, hw, hh, r);
        if (d > 0) { data[i] = data[i + 1] = data[i + 2] = 128; data[i + 3] = 0; continue; }
        const x0 = Math.max(0, x - 1), x1 = Math.min(W - 1, x + 1), y0 = Math.max(0, y - 1), y1 = Math.min(H - 1, y + 1);
        const dX = (veld[y * W + x1] - veld[y * W + x0]) / (x1 - x0 || 1);
        const dY = (veld[y1 * W + x] - veld[y0 * W + x]) / (y1 - y0 || 1);
        const dx = Math.max(-1, Math.min(1, dX * gain)), dy = Math.max(-1, Math.min(1, dY * gain));
        let spec = 0;
        if (d >= -bevel) {
          const gx = sdBox(px + 1, py, hw, hh, r) - sdBox(px - 1, py, hw, hh, r);
          const gy = sdBox(px, py + 1, hw, hh, r) - sdBox(px, py - 1, hw, hh, r);
          const len = Math.hypot(gx, gy) || 1, dot = (gx / len) * lx + (gy / len) * ly;
          spec = (Math.max(0, dot) + Math.max(0, -dot) * 0.35) * (1 - Math.min(1, -d / bevel));
        }
        data[i] = 128 + dx * 127; data[i + 1] = 128 + dy * 127; data[i + 2] = Math.round(spec * 255); data[i + 3] = 255;
      }
    }
    return { data, width: W, height: H };
  }
  // een blob-url, want WebKit weigert data:-url's in feImage
  async function kaartUrl(o) {
    const { data, width, height } = kaartData(o);
    const c = document.createElement("canvas");
    c.width = width; c.height = height;
    c.getContext("2d").putImageData(new ImageData(data, width, height), 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    if (!blob) throw new Error("kaart");
    return URL.createObjectURL(blob);
  }
  function filterSvg({ id, mapUrl, width, height, scale, aberration, frost }) {
    const pad = Math.ceil(scale + aberration + 4), px = (pad / width) * 100, py = (pad / height) * 100;
    const regio = `x="-${px.toFixed(3)}%" y="-${py.toFixed(3)}%" width="${(100 + 2 * px).toFixed(3)}%" height="${(100 + 2 * py).toFixed(3)}%"`;
    const map = `<feImage href="${mapUrl}" xlink:href="${mapUrl}" x="0" y="0" width="${width}" height="${height}" result="map" preserveAspectRatio="none"/>`;
    const dis = (s, res) => `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="${res}"/>`;
    const body = aberration <= 0 ? dis(scale, "rgb") : `${dis(scale + aberration, "dispR")}
  <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
  ${dis(scale, "dispG")}
  <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
  ${dis(Math.max(0, scale - aberration), "dispB")}
  <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
  <feBlend in="red" in2="green" mode="screen" result="rg"/>
  <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><filter id="${id}" color-interpolation-filters="sRGB" ${regio}>
  ${map}
  ${body}
  <feGaussianBlur in="rgb" stdDeviation="${frost}"/>
</filter></svg>`;
  }
})();
