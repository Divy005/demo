/* Aarohi floating gallery.
   The outfits float around the viewer on a sphere (or a cylinder), drawn with CSS 3D:
   each frame the tiles' positions are rotated in JavaScript and handed to the browser as
   translate3d + rotate, under one CSS perspective. GSAP runs the transitions. */
(() => {
  'use strict';

  const { CONFIG, TEXT } = window;
  const B = CONFIG.business;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduceMotion ? 0 : s); // Durations collapse with reduced motion

  /* ================= Language and text ================= */
  let lang = 'en';
  try {
    if (localStorage.getItem('lang') === 'gu') lang = 'gu';
  } catch (e) {} // Storage can be blocked; English is fine then
  const t = (key) => TEXT[lang][key] ?? TEXT.en[key] ?? key;
  document.documentElement.lang = lang;

  const bindings = {
    name: B.name,
    subtitle: lang === 'gu' ? B.subtitleGu : B.subtitle,
    fullName: B.fullName,
    founder: B.founder,
    address: B.address,
    timings: B.timings,
    sunday: B.sunday,
    phoneDisplay: B.phoneDisplay,
  };
  $$('[data-bind]').forEach((el) => (el.textContent = bindings[el.dataset.bind] ?? ''));
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.title = `${B.name} · ${B.subtitle}`;

  $('#langToggle').addEventListener('click', () => {
    try {
      localStorage.setItem('lang', lang === 'en' ? 'gu' : 'en');
    } catch (e) {}
    location.reload();
  });

  /* ================= Seeded randomness (the same layout and drawing every visit) ================= */
  const rng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  /* ================= Parchment background, drawn once per size ================= */
  const paintPaper = () => {
    const cv = $('#paper');
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const base = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.78);
    base.addColorStop(0, '#f0e7d6');
    base.addColorStop(0.6, '#e8ddc8');
    base.addColorStop(1, '#ddcfb5');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Soft age stains
    const r = rng(7);
    for (let i = 0; i < 9; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = (0.12 + r() * 0.22) * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(160, 128, 88, 0.06)');
      g.addColorStop(1, 'rgba(160, 128, 88, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    // Paper grain
    const grain = document.createElement('canvas');
    grain.width = grain.height = 160;
    const gctx = grain.getContext('2d');
    const img = gctx.createImageData(160, 160);
    const gr = rng(11);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 90 + gr() * 80;
      img.data[i] = v;
      img.data[i + 1] = v * 0.86;
      img.data[i + 2] = v * 0.7;
      img.data[i + 3] = gr() * 22;
    }
    gctx.putImageData(img, 0, 0);
    ctx.fillStyle = ctx.createPattern(grain, 'repeat');
    ctx.fillRect(0, 0, w, h);

    const ink = (a) => `rgba(92, 70, 48, ${a})`;
    const unit = clamp(Math.min(w, h) / 900, 0.55, 1.3);

    // Auspicious clouds: a scalloped top over a softly waving base, with a curl at each end
    const curl = (x, y, rad, dir) => {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 3; a += 0.08) {
        const rr = rad * (1 - a / (Math.PI * 3.4));
        const px = x + Math.cos(a * dir + Math.PI) * rr;
        const py = y + Math.sin(a * dir + Math.PI) * rr;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    const cloud = (cx, cy, s, flip, seed) => {
      const cr = rng(seed);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(flip ? -s : s, s);
      const bumps = 3 + Math.floor(cr() * 3);
      const radii = Array.from({ length: bumps }, (_, i) => {
        const mid = 1 - Math.abs(i - (bumps - 1) / 2) / bumps; // Taller in the middle
        return (10 + cr() * 8) * (0.7 + mid * 0.6);
      });
      const len = radii.reduce((sum, r0) => sum + r0 * 2, 0);
      [0, 1].forEach((pass) => {
        const k = pass ? 0.78 : 1;
        ctx.beginPath();
        let x = 0;
        ctx.moveTo(0, 0);
        radii.forEach((r0) => {
          ctx.arc(x + r0, 0, r0 * k, Math.PI, 0, false); // Each bump starts where the last ended
          x += r0 * 2;
        });
        ctx.bezierCurveTo(len + 14, 10, len * 0.7, 16, len * 0.5, 9);
        ctx.bezierCurveTo(len * 0.3, 3, 6, 18, -4, 7);
        ctx.strokeStyle = ink(pass ? 0.1 : 0.2);
        ctx.lineWidth = pass ? 0.7 : 1;
        ctx.stroke();
      });
      ctx.strokeStyle = ink(0.18);
      ctx.lineWidth = 0.9;
      curl(-6, 6, 9, 1);
      curl(len + 6, 4, 7, -1);
      // Trailing wisps
      ctx.beginPath();
      ctx.moveTo(len * 0.2, 22);
      ctx.bezierCurveTo(len * 0.5, 30, len * 0.8, 18, len * 1.25, 26);
      ctx.strokeStyle = ink(0.12);
      ctx.stroke();
      ctx.restore();
    };
    cloud(w * 0.04, h * 0.2, unit * 1.3, false, 3);
    cloud(w * 0.14, h * 0.3, unit * 0.9, false, 5);
    cloud(w * 0.95, h * 0.17, unit * 1.15, true, 13);
    cloud(w * 0.86, h * 0.27, unit * 0.8, true, 17);

    // Hills in the corners: layered ridges with hatched slopes and small trees, like a miniature's landscape
    const hills = (side, seed) => {
      const hr = rng(seed);
      const span = w * 0.42;
      const x0 = side < 0 ? -w * 0.04 : w - span;
      for (let layer = 0; layer < 4; layer++) {
        const baseY = h * (0.8 + layer * 0.055);
        const peaks = Array.from({ length: 3 }, () => ({
          c: x0 + hr() * span,
          a: (40 + hr() * 70) * unit * (1 - layer * 0.18),
          wd: (60 + hr() * 120) * unit,
        }));
        const ridge = (x) => {
          let y = baseY;
          peaks.forEach((p) => (y -= p.a * Math.exp(-(((x - p.c) / p.wd) ** 2))));
          return y + Math.sin(x * 0.05 + layer) * 2;
        };
        // Fade the ridge out towards the middle of the screen
        const fade = (x) => clamp(side < 0 ? 1 - (x - x0) / span : (x - x0) / span, 0, 1);
        const alpha = 0.26 - layer * 0.04;
        ctx.lineWidth = 1;
        for (let x = x0; x < x0 + span; x += 3) {
          const y1 = ridge(x);
          const y2 = ridge(x + 3);
          ctx.strokeStyle = ink(alpha * fade(x));
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x + 3, y2);
          ctx.stroke();
          // Hatching down the slope
          if (hr() < 0.55) {
            const slope = (y2 - y1) / 3;
            const len = 5 + hr() * 14 * unit;
            ctx.strokeStyle = ink(alpha * 0.5 * fade(x));
            ctx.beginPath();
            ctx.moveTo(x, y1 + 3);
            ctx.lineTo(x + slope * 4, y1 + 3 + len);
            ctx.stroke();
          }
          // A few trees on the ridge
          if (layer < 2 && hr() < 0.035) {
            const th = (8 + hr() * 10) * unit;
            ctx.strokeStyle = ink(alpha * 0.9 * fade(x));
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y1 - th);
            ctx.moveTo(x - th * 0.32, y1 - th * 0.3);
            ctx.lineTo(x, y1 - th);
            ctx.lineTo(x + th * 0.32, y1 - th * 0.3);
            ctx.stroke();
          }
        }
      }
    };
    hills(-1, 21);
    hills(1, 34);
  };

  /* ================= Gallery data ================= */
  const shown = CONFIG.outfits.filter((o) => o.photos && o.photos.length);
  const pieces = shown.flatMap((o) => o.photos.map((src, k) => ({ o, src, k })));
  const isSmall = () => window.innerWidth < 720;
  const COUNT = pieces.length ? (isSmall() ? 26 : 40) : 0;
  const lr = rng(42);
  // Spread repeats of the same photo apart
  const order = Array.from({ length: COUNT }, (_, i) => pieces[(i * 7) % pieces.length] || pieces[i % pieces.length]);

  const tiles = order.map((piece, i) => {
    // Sphere: a golden spiral, flattened a little towards the poles
    const y = 1 - ((i + 0.5) / COUNT) * 2;
    const ring = Math.sqrt(1 - y * y);
    const phi = i * 2.399963;
    const sphereDir = [Math.cos(phi) * ring, y * 0.82, Math.sin(phi) * ring];
    // Cylinder: three rows around the viewer
    const rows = 3;
    const row = i % rows;
    const col = Math.floor(i / rows);
    const perRow = Math.ceil(COUNT / rows);
    const theta = ((col + row * 0.5) / perRow) * Math.PI * 2;
    const cylDir = [Math.sin(theta), (row - 1) * 0.48, -Math.cos(theta)];
    return {
      ...piece,
      sphereDir,
      cylDir,
      sphereR: 0.74 + lr() * 0.34, // Some float closer, some further
      cylR: 0.9 + lr() * 0.12,
      scale: 0.78 + lr() * 0.4,
      bob: lr() * Math.PI * 2,
    };
  });

  const tilesEl = $('#tiles');
  tilesEl.innerHTML = tiles
    .map((tile, i) => `<button type="button" class="tile" data-i="${i}" aria-label="${esc(tile.o.name)}"><img src="${esc(tile.src)}" alt="" draggable="false" decoding="async" /></button>`)
    .join('');
  const tileEls = $$('.tile', tilesEl);

  /* ================= Camera and rendering ================= */
  const stage = $('#stage');
  let W = 0, H = 0, P = 0, R = 0, CAM = 0, TILE = 0;
  const measure = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    // CSS perspective, the camera's focal length (shorter on phones, so more pieces fit the narrow screen)
    P = isSmall() ? H * 0.42 : Math.max(W * 0.42, H * 0.62);
    R = P * 1.75; // Sphere radius
    CAM = R * 0.3; // The camera sits a little behind the centre, so pieces at the edges are seen at an angle
    TILE = isSmall() ? clamp(W * 0.3, 100, 150) : clamp(Math.min(W, H) * 0.22, 105, 230);
    tilesEl.style.perspective = `${P}px`; // On the tiles' own parent, so taps land where the pieces are drawn
    tilesEl.style.setProperty('--w', `${TILE}px`);
  };

  const view = {
    yaw: 0.4,
    pitch: 0.06,
    vel: 0,
    pitchVel: 0,
    morph: 0, // 0 = sphere, 1 = cylinder
    alpha: 1, // Whole gallery fade (for the detail view and the panels)
    frozen: false,
  };
  let hiddenTile = -1; // The tile that's flying to or from the detail view

  const render = (time) => {
    const ca = Math.cos(view.yaw), sa = Math.sin(view.yaw);
    const cb = Math.cos(view.pitch), sb = Math.sin(view.pitch);
    const m = view.morph < 0.5 ? 2 * view.morph * view.morph : 1 - (-2 * view.morph + 2) ** 2 / 2; // easeInOut
    const rot = (x, y, z) => {
      const x1 = x * ca + z * sa;
      const z1 = -x * sa + z * ca;
      return [x1, y * cb - z1 * sb, y * sb + z1 * cb];
    };
    tiles.forEach((tile, i) => {
      const el = tileEls[i];
      const s = tile.sphereDir, c = tile.cylDir;
      const rad = lerp(tile.sphereR, tile.cylR, m) * R;
      let px = lerp(s[0], c[0], m), py = lerp(s[1], c[1], m), pz = lerp(s[2], c[2], m);
      // Facing the centre (sphere) or the axis (cylinder)
      const nl = Math.hypot(px, m > 0.5 ? 0 : py, pz) || 1;
      let nx = -px / nl, ny = m > 0.5 ? 0 : -py / nl, nz = -pz / nl;
      px *= rad; py *= rad; pz *= rad;
      py += reduceMotion ? 0 : Math.sin(time * 0.0006 + tile.bob) * 7; // Gentle float
      [px, py, pz] = rot(px, py, pz);
      [nx, ny, nz] = rot(nx, ny, nz);
      const zc = pz - CAM; // Relative to the camera
      const facing = -nx * px - ny * py + nz * (CAM - pz); // Below 0: we'd see its back
      const opacity = clamp((-zc - R * 0.32) / (R * 0.22), 0, 1) * view.alpha;
      if (opacity <= 0.01 || facing <= 0 || i === hiddenTile) {
        if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
        return;
      }
      el.style.visibility = 'visible';
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = String(Math.round(20000 + zc));
      const rx = -Math.asin(clamp(ny, -1, 1));
      const ry = Math.atan2(nx, nz);
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, ${(zc + P).toFixed(1)}px) rotateY(${ry.toFixed(4)}rad) rotateX(${rx.toFixed(4)}rad) scale(${tile.scale})`;
    });
  };

  let last = 0;
  const loop = (time) => {
    const dt = Math.min(0.05, (time - (last || time)) / 1000);
    last = time;
    if (!view.frozen) {
      if (!dragging) {
        view.yaw += view.vel;
        view.vel *= 0.95;
        view.pitch += view.pitchVel;
        view.pitchVel *= 0.9;
        view.pitch += (0.06 - view.pitch) * 0.01; // Drifts back to level
        if (!reduceMotion) view.yaw += dt * 0.045; // Slow turn
      }
    }
    render(time);
    requestAnimationFrame(loop);
  };

  /* ---- Dragging, wheel and keys turn the gallery ---- */
  let dragging = false, wasDrag = false, lastX = 0, lastY = 0, moved = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (view.frozen) return;
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    view.vel = 0;
    stage.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    view.vel = -dx * 0.0032;
    view.yaw += view.vel;
    view.pitch = clamp(view.pitch + dy * 0.0022, -0.5, 0.5);
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    wasDrag = moved > 6;
    stage.classList.remove('is-dragging');
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  stage.addEventListener('wheel', (e) => {
    if (view.frozen) return;
    e.preventDefault();
    view.vel += (e.deltaY + e.deltaX) * 0.00012;
  }, { passive: false });
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') view.vel += 0.04;
    if (e.key === 'ArrowLeft') view.vel -= 0.04;
  });
  tilesEl.addEventListener('click', (e) => {
    const el = e.target.closest('.tile');
    if (!el || wasDrag || view.frozen) return (wasDrag = false);
    openDetail(+el.dataset.i);
  });

  /* ---- Sphere / cylinder ---- */
  $$('.switch__opt').forEach((btn) =>
    btn.addEventListener('click', () => {
      const toCyl = btn.dataset.layout === 'cylinder';
      $$('.switch__opt').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn);
      });
      gsap.to(view, { morph: toCyl ? 1 : 0, duration: D(1.6), ease: 'none' });
      gsap.to(view, { pitch: toCyl ? 0 : 0.06, duration: D(1.2), ease: 'power2.inOut' });
    }),
  );

  /* ================= Prices and WhatsApp ================= */
  const priceText = (o) => {
    const f = (p) => '₹' + (p == null ? '[price]' : Number(p).toLocaleString('en-IN'));
    const rent = `${t('rentFrom')} ${f(o.rentPrice)}`;
    const buy = `${t('buyFrom')} ${f(o.buyPrice)}`;
    return o.offer === 'rent' ? rent : o.offer === 'buy' ? buy : `${rent} ${t('or')} ${buy}`;
  };
  const canGoLive = () => CONFIG.liveMode && /^\d{8,15}$/.test(B.whatsappNumber);
  const waLink = (msg) => `https://wa.me/${B.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  const today = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  };
  const fmtDate = (v) => {
    if (!v) return '[date]';
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  /* ================= Outfit detail ================= */
  const detail = $('#detail');
  const detailImg = $('#detailImg');
  let busy = false, current = null, currentTile = -1, nameSplit = null;

  const fillDetail = (o, src) => {
    $('#detailCode').textContent = `${o.code} · ${o.category}`;
    nameSplit?.revert();
    $('#detailName').textContent = o.name;
    $('#detailDesc').textContent = o.description;
    $('#detailFacts').innerHTML = [
      [t('price'), priceText(o)],
      [t('fabric'), o.fabric],
      [t('work'), o.work],
    ].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    detailImg.src = src;
    detailImg.alt = o.name;
    $('#detailThumbs').innerHTML = o.photos.length > 1
      ? o.photos.map((p, k) => `<button type="button" data-src="${esc(p)}" aria-label="${esc(o.name)} ${k + 1}" aria-pressed="${p === src}"><img src="${esc(p)}" alt="" /></button>`).join('')
      : '';
  };
  $('#detailThumbs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-src]');
    if (!b) return;
    gsap.fromTo(detailImg, { autoAlpha: 0.3 }, { autoAlpha: 1, duration: D(0.5) });
    detailImg.src = b.dataset.src;
    $$('#detailThumbs button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  });

  // A copy of the photo that flies between the tile and the detail view
  const makeFly = (src, rect) => {
    const fly = document.createElement('img');
    fly.className = 'fly';
    fly.src = src;
    fly.alt = '';
    Object.assign(fly.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    document.body.appendChild(fly);
    return fly;
  };

  const chromeOut = () => gsap.to(['#title', '#switch', '.hint'], { autoAlpha: 0, duration: D(0.5) });
  const chromeIn = () => gsap.to(['#title', '#switch', '.hint'], { autoAlpha: 1, duration: D(0.6) });

  function openDetail(i) {
    if (busy) return;
    busy = true;
    const tile = tiles[i];
    const el = tileEls[i];
    current = tile.o;
    currentTile = i;
    view.frozen = true;
    view.vel = 0;

    fillDetail(tile.o, tile.src);
    detail.hidden = false;
    gsap.set(detail, { autoAlpha: 1 });
    const parts = ['.detail__code', '.detail__desc', '.detail__facts', '.detail__actions', '.detail__thumbs', '#detailClose'];
    gsap.set(parts, { autoAlpha: 0 });
    gsap.set(detailImg, { autoAlpha: 0 });

    const from = el.getBoundingClientRect();
    const to = detailImg.getBoundingClientRect();
    const fly = makeFly(tile.src, from);
    hiddenTile = i;
    const turn = from.left + from.width / 2 < W / 2 ? 38 : -38; // Turns in from the side it was on

    nameSplit = SplitText.create('#detailName', { type: 'words, chars', charsClass: 'char' });

    gsap.timeline({
      onComplete: () => {
        gsap.set(detailImg, { autoAlpha: 1 });
        fly.remove();
        busy = false;
        $('#detailClose').focus({ preventScroll: true });
      },
    })
      .to(view, { alpha: 0, duration: D(0.7), ease: 'power2.out' }, 0)
      .add(chromeOut(), 0)
      .fromTo(fly, { rotationY: turn * 0.4, transformPerspective: 1200 }, {
        left: to.left, top: to.top, width: to.width, height: to.height,
        rotationY: turn * -0.25, duration: D(1.05), ease: 'power3.inOut',
      }, 0)
      .to(fly, { rotationY: 0, duration: D(0.6), ease: 'power2.out' }, '>-0.05')
      .fromTo(nameSplit.chars, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: D(0.6), ease: 'power3.out', stagger: D(0.022) }, D(0.55))
      .to(parts, { autoAlpha: 1, duration: D(0.6), stagger: D(0.07) }, D(0.75));
  }

  function closeDetail(quick) {
    if (busy || detail.hidden) return;
    busy = true;
    const el = tileEls[currentTile];
    const from = detailImg.getBoundingClientRect();
    const fly = makeFly(detailImg.src, from);
    gsap.set(detailImg, { autoAlpha: 0 });
    const parts = ['#detailName', '.detail__code', '.detail__desc', '.detail__facts', '.detail__actions', '.detail__thumbs', '#detailClose'];

    const finish = () => {
      detail.hidden = true;
      gsap.set(parts, { clearProps: 'all' });
      nameSplit?.revert();
      nameSplit = null;
      hiddenTile = -1;
      fly.remove();
      busy = false;
      view.frozen = false;
      el?.focus({ preventScroll: true });
    };

    if (quick) {
      gsap.to(fly, { autoAlpha: 0, duration: D(0.3), onComplete: finish });
      gsap.to(parts, { autoAlpha: 0, duration: D(0.3) });
      return;
    }
    // Show the tile's place for a moment to measure where to fly back to
    hiddenTile = -1;
    view.alpha = 0.001;
    render(performance.now());
    const to = el.getBoundingClientRect();
    hiddenTile = currentTile;

    gsap.timeline({ onComplete: finish })
      .to(parts, { autoAlpha: 0, duration: D(0.35) }, 0)
      .to(fly, { left: to.left, top: to.top, width: to.width, height: to.height, rotationY: to.left + to.width / 2 < W / 2 ? 20 : -20, transformPerspective: 1200, duration: D(0.95), ease: 'power3.inOut' }, D(0.1))
      .to(fly, { autoAlpha: 0, duration: D(0.25) }, '>-0.15')
      .to(view, { alpha: 1, duration: D(0.8), ease: 'power2.inOut' }, D(0.35))
      .add(chromeIn(), D(0.5));
  }
  $('#detailClose').addEventListener('click', () => closeDetail());

  /* ================= Sheet: enquiries and notices ================= */
  const sheet = $('#sheet');
  let sheetOpener = null;
  const openSheet = (html, opener) => {
    sheetOpener = opener || document.activeElement;
    $('#sheetPanel').innerHTML = `<button class="sheet__close" type="button" data-close-sheet>${esc(t('close'))}</button>${html}`;
    sheet.hidden = false;
    gsap.fromTo('#sheetPanel', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: D(0.45), ease: 'power3.out' });
    $('[data-close-sheet]', sheet).focus({ preventScroll: true });
  };
  const closeSheet = () => {
    if (sheet.hidden) return false;
    sheet.hidden = true;
    sheetOpener?.focus?.({ preventScroll: true });
    return true;
  };
  sheet.addEventListener('click', (e) => {
    if (e.target === sheet || e.target.closest('[data-close-sheet]')) closeSheet();
  });
  const notice = (text, opener) => openSheet(`<p class="sheet__title" id="sheetTitle">${esc(t('notLive'))}</p><p>${esc(text)}</p>`, opener);

  const copyText = (text) => {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        toast(t('copied'));
      } catch (e) {}
      ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => toast(t('copied')), fallback);
    else fallback();
  };
  let toastTimer = 0;
  const toast = (msg) => {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  };

  $('#detailEnquire').addEventListener('click', (e) => {
    const o = current;
    const message = (date) => `Hi ${B.fullName}, I'm interested in ${o.name} (${o.code}). Is it available on ${fmtDate(date)}?`;
    if (canGoLive()) return window.open(waLink(message('')), '_blank', 'noopener');
    openSheet(
      `<p class="sheet__title" id="sheetTitle">${esc(o.name)}</p>
       <div class="field"><label for="enqDate">${esc(t('enqDate'))}</label><input id="enqDate" type="date" min="${today()}" /></div>
       <p class="sheet__label">${esc(t('enqSub'))}</p>
       <pre class="message" id="enqMsg"></pre>
       <p>${esc(t('liveNote'))}</p>
       <div class="row"><button class="btn btn--dark" type="button" id="enqCopy">${esc(t('copy'))}</button></div>`,
      e.currentTarget,
    );
    const msgEl = $('#enqMsg');
    const update = () => (msgEl.textContent = message($('#enqDate').value));
    update();
    $('#enqDate').addEventListener('input', update);
    $('#enqCopy').addEventListener('click', () => copyText(msgEl.textContent));
  });

  $('#detailBook').addEventListener('click', () => {
    const o = current;
    const typeFor = { 'Kurta sets': 'Kurta set', Bandhani: 'Bandhani', Navratri: 'Navratri chaniya choli', Sarees: 'Saree / Gharchola', Bridal: 'Bridal lehenga' };
    if (typeFor[o.category] && CONFIG.outfitTypes.includes(typeFor[o.category])) $('#fType').value = typeFor[o.category];
    const msg = $('#fMsg');
    if (!msg.value.includes(o.code)) msg.value = `${msg.value ? `${msg.value}\n` : ''}Interested in ${o.name} (${o.code}).`;
    showView('visit', () => $('#fName').focus({ preventScroll: true }));
  });

  $$('[data-chat]').forEach((b) =>
    b.addEventListener('click', (e) => {
      if (canGoLive()) return window.open(waLink(`Hi ${B.fullName}, I have a question.`), '_blank', 'noopener');
      openSheet(`<p class="sheet__title" id="sheetTitle">${esc(t('whatsapp'))}</p><p>${esc(t('chatText'))}</p>`, e.currentTarget);
    }),
  );

  /* ================= Panels: story, reviews, visit ================= */
  let currentView = 'collection';
  const showView = (name, then) => {
    if (busy) return;
    $$('.nav__item').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.view === name);
      if (b.dataset.view === name) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    if (!detail.hidden) closeDetail(true);
    const old = currentView !== 'collection' ? $(`#panel-${currentView}`) : null;
    currentView = name;

    if (old) gsap.to(old, { autoAlpha: 0, duration: D(0.35), onComplete: () => (old.hidden = true) });

    if (name === 'collection') {
      view.frozen = false;
      gsap.to(view, { alpha: 1, duration: D(0.9), ease: 'power2.inOut', delay: D(0.2) });
      chromeIn();
      return;
    }

    view.frozen = true;
    gsap.to(view, { alpha: 0, duration: D(0.6), ease: 'power2.out' });
    chromeOut();
    const panel = $(`#panel-${name}`);
    panel.hidden = false;
    panel.scrollTop = 0;
    gsap.set(panel, { autoAlpha: 1 });
    gsap.fromTo(
      $$('.panel__inner > *', panel),
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: D(0.8), ease: 'power3.out', stagger: D(0.07), delay: D(old ? 0.3 : 0.35), onComplete: then },
    );
  };
  $$('.nav__item').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (closeSheet()) return;
    if (!detail.hidden) return closeDetail();
    if (currentView !== 'collection') showView('collection');
  });

  /* ---- Story, reviews and visit content ---- */
  $('#storyText').innerHTML = CONFIG.story.map((p) => `<p>${esc(p)}</p>`).join('');
  const storyPhoto = shown[0]?.photos[1] || shown[0]?.photos[0];
  if (storyPhoto) {
    $('#storyImg').src = storyPhoto;
    $('#storyImg').alt = shown[0].name;
  } else $('.story__figure').remove();

  $('#ratingText').innerHTML = `<span class="stars" aria-hidden="true">★★★★★</span> ${esc(B.googleRating)} ${esc(t('onGoogle'))} · ${esc(B.googleReviewCount)} ${esc(t('reviewsWord'))}`;
  $('#reviewList').innerHTML = CONFIG.reviews
    .map((r) => `<figure class="review"><blockquote>“${esc(r.text)}”</blockquote><figcaption>${esc(r.name)} · ${esc(r.detail)}</figcaption></figure>`)
    .join('');
  $('#googleLink').href = B.googleReviewsUrl;
  $('#googleLink').addEventListener('click', (e) => {
    if (B.googleReviewsUrl !== '#') return;
    e.preventDefault();
    notice("This button will open the boutique's Google reviews page.", e.currentTarget);
  });
  $('#demoNote').textContent = `Demo website prepared by ${B.demoBy}. Prices, story and reviews are sample content.`;

  $('#map').innerHTML = `
    <svg viewBox="0 0 400 250" fill="none" stroke="#5c4630" stroke-linecap="round" role="img" aria-label="Map placeholder: the studio on Kalawad Road, Rajkot">
      <path d="M-10 140 C 70 128 150 150 230 136 S 360 120 410 128" stroke-width="2.2" stroke-opacity="0.75"/>
      <path d="M-10 146 C 70 134 150 156 230 142 S 360 126 410 134" stroke-width="0.8" stroke-opacity="0.45"/>
      <path d="M120 -10 C 126 60 116 140 132 260 M300 -10 C 292 80 306 170 296 260 M200 -10 C 210 40 196 90 214 138" stroke-width="1" stroke-opacity="0.35"/>
      <path d="M20 220 C 90 200 160 232 240 210 S 360 196 400 206" stroke-width="7" stroke-opacity="0.12"/>
      <text x="22" y="124" fill="#5c4630" stroke="none" font-family="Josefin Sans, sans-serif" font-size="11" letter-spacing="2" fill-opacity="0.8">KALAWAD ROAD</text>
      <circle cx="248" cy="138" r="15" stroke-opacity="0.45"/>
      <circle cx="248" cy="138" r="4.5" fill="#2f382a" stroke="none"/>
    </svg>
    <span class="map__note">${esc(t('mapNote'))}</span>`;
  $('#dirBtn').addEventListener('click', (e) => {
    if (B.mapsUrl && B.mapsUrl !== '#') return window.open(B.mapsUrl, '_blank', 'noopener');
    notice('The "Get directions" button will open Google Maps at the studio.', e.currentTarget);
  });
  $('#videoCall').addEventListener('click', (e) => {
    const msg = `Hi ${B.fullName}, I would like to book a video call to see your collection. I'm based in [city / country].`;
    if (canGoLive()) return window.open(waLink(msg), '_blank', 'noopener');
    openSheet(`<p class="sheet__title" id="sheetTitle">${esc(t('ctaVideo'))}</p><p class="sheet__label">${esc(t('enqSub'))}</p><pre class="message">${esc(msg)}</pre><p>${esc(t('liveNote'))}</p>`, e.currentTarget);
  });

  /* ---- Booking form ---- */
  const fill = (sel, list) => {
    $(sel).innerHTML = `<option value="">${esc(t('choose'))}</option>` + list.map((x) => `<option>${esc(x)}</option>`).join('');
  };
  fill('#fType', CONFIG.outfitTypes);
  fill('#fBudget', CONFIG.budgetRanges);
  $('#fDate').min = today();
  const form = $('#bookForm');
  const ready = $('#ready');
  $$('#bookForm input, #bookForm select').forEach((el) => el.addEventListener('input', () => el.closest('.field').classList.remove('invalid')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    const check = (id, ok) => {
      $(id).closest('.field').classList.toggle('invalid', !ok);
      if (!ok && !first) first = $(id);
    };
    check('#fName', $('#fName').value.trim().length > 1);
    check('#fPhone', $('#fPhone').value.replace(/\D/g, '').length >= 8);
    check('#fDate', !!$('#fDate').value);
    check('#fType', !!$('#fType').value);
    if (first) return first.focus();
    const v = (id) => $(id).value.trim();
    const msg = [
      `Hello ${B.fullName},`,
      'I would like to book a trial.',
      '',
      `Name: ${v('#fName')}`,
      `Phone: ${v('#fPhone')}`,
      `Function date: ${fmtDate(v('#fDate'))}`,
      `Outfit type: ${v('#fType')}`,
      v('#fBudget') && `Budget: ${v('#fBudget')}`,
      v('#fMsg') && `Message: ${v('#fMsg')}`,
    ].filter(Boolean).join('\n').replace('trial.\n\n', 'trial.\n\n');
    if (canGoLive()) return window.open(waLink(msg), '_blank', 'noopener');
    $('#readyMsg').textContent = msg;
    gsap.to(form, {
      autoAlpha: 0, y: -16, duration: D(0.3),
      onComplete: () => {
        form.hidden = true;
        ready.hidden = false;
        gsap.fromTo(ready, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: D(0.45) });
        ready.focus({ preventScroll: true });
      },
    });
  });
  $('#editBooking').addEventListener('click', () => {
    ready.hidden = true;
    form.hidden = false;
    gsap.fromTo(form, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: D(0.4) });
    $('#fName').focus({ preventScroll: true });
  });
  $('#copyBooking').addEventListener('click', () => copyText($('#readyMsg').textContent));

  /* ================= Start ================= */
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    measure();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(paintPaper, 150);
  });
  measure();
  paintPaper();
  // Opening: the pieces drift in from far away
  view.alpha = 0;
  gsap.to(view, { alpha: 1, duration: D(1.6), ease: 'power2.out', delay: D(0.2) });
  if (!reduceMotion) gsap.from(view, { yaw: view.yaw - 0.9, duration: 2.6, ease: 'power3.out' });
  gsap.from('#title > *', { autoAlpha: 0, y: 14, duration: D(1.2), ease: 'power3.out', stagger: D(0.15), delay: D(0.3) });
  requestAnimationFrame(loop);
})();
