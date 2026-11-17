/* =========================================================
   ORBIT IMAGES
   Versão em JavaScript puro do componente <OrbitImages /> do
   React Bits, criado por Dominik Koch (https://x.com/dominikkoch).
   O motor da órbita é o original; aqui cada item pode ser
   qualquer elemento, não só uma imagem. Só a forma de elipse
   foi trazida, que é a usada no site.
========================================================= */

const SAMPLES = 720;
const FRONT_GROW = 0.3;
const BACK_SHRINK = 0.45;
const BACK_DIM = 0.55;
const INTRO_SPREAD = 1.3;
const INTRO_FADE = 0.45;
const DRAG_THRESHOLD = 5;
const SVG_NS = 'http://www.w3.org/2000/svg';

let clipCount = 0;

const ellipsePath = (cx, cy, rx, ry) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrapSigned = (value) => value - Math.round(value);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

const createEngine = (root, config, setAspect) => {
  const query = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const st = {
    lut: null, length: 0, front: 0, yMid: 0, yHalf: 1, bbox: [0, 0, 1, 1],
    width: 0, height: 0, scale: 0, size: 0, items: [], strokes: [],
    lap: 0, manual: 0, glide: 0, speed: 1, drag: null, seek: null,
    hovered: false, hoverIndex: -1, suppressUntil: 0, introStart: -1,
    introDone: !config.current.intro, visible: typeof IntersectionObserver === 'undefined',
    reduced: !!query?.matches, raf: 0, last: 0, destroyed: false
  };
  st.speed = st.reduced || config.current.paused ? 0 : 1;

  const collect = () => {
    st.items = Array.from(root.querySelectorAll('[data-orbit-item]')).map((el) => ({ el, t: '', o: '', z: '' }));
    st.strokes = Array.from(root.querySelectorAll('[data-orbit-stroke]'));
  };

  const build = () => {
    const cfg = config.current;
    const path = root.querySelector('[data-orbit-path]');
    let length = 0;
    try {
      length = path ? path.getTotalLength() : 0;
    } catch {
      length = 0;
    }
    if (!path || !length || !isFinite(length)) {
      st.lut = null;
      return;
    }
    const lut = new Float32Array(SAMPLES * 2);
    const angle = (cfg.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const origin = cfg.baseWidth / 2;
    let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
    let front = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const point = path.getPointAtLength((i / SAMPLES) * length);
      const dx = point.x - origin;
      const dy = point.y - origin;
      const x = origin + dx * cos - dy * sin;
      const y = origin + dx * sin + dy * cos;
      lut[i * 2] = x;
      lut[i * 2 + 1] = y;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x);
      y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      if (y > lut[front * 2 + 1] + 1e-6) front = i;
    }
    st.lut = lut;
    st.length = length;
    st.front = front / SAMPLES;
    st.yMid = (y0 + y1) / 2;
    st.yHalf = Math.max(1e-3, (y1 - y0) / 2);
    const depth = clamp(cfg.depth, 0, 1);
    const margin = (cfg.itemSize / 2) * (1 + depth * FRONT_GROW) * Math.max(1, cfg.hoverScale) + 2;
    st.bbox = [x0 - margin, y0 - margin, x1 + margin, y1 + margin];
    setAspect((x1 - x0 + margin * 2) / (y1 - y0 + margin * 2));
  };

  const applyDash = (reveal) => {
    const cfg = config.current;
    const dash = cfg.pathDash > 0 && st.scale ? cfg.pathDash / st.scale : 0;
    for (const stroke of st.strokes) {
      if (reveal < 1 && !dash) {
        stroke.style.strokeDasharray = `${st.length} ${st.length}`;
        stroke.style.strokeDashoffset = String(st.length * (1 - reveal));
        stroke.style.opacity = '';
      } else {
        stroke.style.strokeDasharray = dash ? `${dash} ${dash * 1.6}` : '';
        stroke.style.strokeDashoffset = '';
        stroke.style.opacity = reveal < 1 ? String(reveal) : '';
      }
    }
  };

  const layout = () => {
    const cfg = config.current;
    st.width = root.clientWidth;
    st.height = root.clientHeight;
    if (!st.lut) return;
    const [bx0, by0, bx1, by1] = st.bbox;
    const scale = Math.min(st.width / (bx1 - bx0), st.height / (by1 - by0));
    st.scale = scale > 0 && isFinite(scale) ? scale : 0;
    st.size = cfg.itemSize * st.scale;
    for (const it of st.items) {
      it.el.style.width = `${st.size}px`;
      it.el.style.height = `${st.size}px`;
    }
    if (!st.scale) return;
    const vw = st.width / st.scale;
    const vh = st.height / st.scale;
    const cx = (bx0 + bx1) / 2;
    const cy = (by0 + by1) / 2;
    root.querySelectorAll('[data-orbit-svg]').forEach((svg) => {
      svg.setAttribute('viewBox', `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`);
    });
    const clip = root.querySelector('[data-orbit-clip]');
    if (clip) {
      clip.setAttribute('x', String(cx - vw));
      clip.setAttribute('y', String(st.yMid));
      clip.setAttribute('width', String(vw * 2));
      clip.setAttribute('height', String(vh * 2));
    }
    for (const stroke of st.strokes) stroke.style.strokeWidth = String(cfg.pathWidth / st.scale);
    applyDash(1);
  };

  const sample = (u) => {
    const f = (((u % 1) + 1) % 1) * SAMPLES;
    const i0 = Math.floor(f) % SAMPLES;
    const i1 = (i0 + 1) % SAMPLES;
    const t = f - Math.floor(f);
    const lut = st.lut;
    return [lut[i0 * 2] + (lut[i1 * 2] - lut[i0 * 2]) * t, lut[i0 * 2 + 1] + (lut[i1 * 2 + 1] - lut[i0 * 2 + 1]) * t];
  };

  const progress = () => {
    const cfg = config.current;
    return st.lap * (cfg.direction === 'reverse' ? -1 : 1) + st.manual;
  };

  const offsetOf = (index, count) => index / Math.max(1, count);

  const write = (it, key, prop, value) => {
    if (it[key] !== value) {
      it[key] = value;
      it.el.style[prop] = value;
    }
  };

  const render = (now) => {
    const cfg = config.current;
    if (!st.lut || !st.scale) return;
    const p = progress();
    const count = st.items.length;
    const depth = clamp(cfg.depth, 0, 1);
    const [bx0, by0, bx1, by1] = st.bbox;
    const cx = (bx0 + bx1) / 2;
    const cy = (by0 + by1) / 2;
    const half = st.size / 2;
    const introRunning = st.introStart >= 0;
    const elapsed = introRunning ? (now - st.introStart) / 1000 : 0;
    const spread = introRunning ? easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)) : 1;
    const appear = introRunning ? clamp(elapsed / INTRO_FADE, 0, 1) : 1;
    for (let i = 0; i < count; i++) {
      const it = st.items[i];
      let u = p + offsetOf(i, count);
      if (introRunning) u = st.front + wrapSigned(u - st.front) * spread;
      const [x, y] = sample(u);
      const d = clamp((y - st.yMid) / st.yHalf, -1, 1);
      const w = (d + 1) / 2;
      let scale = 1 + depth * (FRONT_GROW * w - BACK_SHRINK * (1 - w));
      let opacity = 1 - depth * BACK_DIM * (1 - w);
      if (introRunning) {
        scale *= 0.7 + 0.3 * appear;
        opacity *= appear * appear * (3 - 2 * appear);
      }
      const sx = (x - cx) * st.scale + st.width / 2 - half;
      const sy = (y - cy) * st.scale + st.height / 2 - half;
      let z = depth > 0 ? (d <= 0 ? 10 + Math.round((d + 1) * 80) : 110 + Math.round(d * 80)) : 1;
      if (i === st.hoverIndex) z += 200;
      write(it, 't', 'transform', `translate3d(${sx.toFixed(2)}px, ${sy.toFixed(2)}px, 0px) scale(${scale.toFixed(4)})`);
      write(it, 'o', 'opacity', opacity > 0.999 ? '' : opacity.toFixed(3));
      write(it, 'z', 'zIndex', String(z));
    }
    if (introRunning) applyDash(easeOutQuint(clamp(elapsed / INTRO_SPREAD, 0, 1)));
  };

  const frame = (now) => {
    st.raf = 0;
    if (st.destroyed) return;
    const cfg = config.current;
    const dt = st.last ? clamp((now - st.last) / 1000, 0, 0.1) : 0;
    st.last = now;
    let busy = false;
    if (st.lut && st.scale && st.introStart === -1 && !st.introDone && st.visible) {
      if (cfg.intro && !st.reduced) st.introStart = now;
      else st.introDone = true;
      root.removeAttribute('data-intro');
    }
    if (st.introStart >= 0) {
      if ((now - st.introStart) / 1000 >= INTRO_SPREAD) {
        st.introStart = -2;
        st.introDone = true;
        applyDash(1);
      } else {
        busy = true;
      }
    }
    const want = cfg.paused || st.reduced ? 0 : st.hovered ? clamp(cfg.hoverSpeed, 0, 1) : 1;
    if (st.speed !== want) {
      st.speed += (want - st.speed) * (1 - Math.exp(-dt / 0.35));
      if (Math.abs(st.speed - want) < 0.002) st.speed = want;
      busy = true;
    }
    if (st.speed > 0 && cfg.duration > 0) {
      st.lap += (dt * st.speed) / cfg.duration;
      busy = true;
    }
    if (st.drag?.active) {
      busy = true;
    } else if (st.seek) {
      st.seek.t = Math.min(1, st.seek.t + dt / st.seek.dur);
      const e = st.seek.t < 0.5 ? 4 * st.seek.t ** 3 : 1 - Math.pow(-2 * st.seek.t + 2, 3) / 2;
      st.manual = st.seek.from + st.seek.delta * e;
      if (st.seek.t >= 1) st.seek = null;
      busy = true;
    } else if (st.glide) {
      st.manual += st.glide * dt;
      st.glide *= Math.exp(-dt / 0.7);
      if (Math.abs(st.glide) < 0.0004) st.glide = 0;
      busy = true;
    }
    render(now);
    const whole = Math.floor(st.lap);
    if (whole) st.lap -= whole;
    if (!st.drag && !st.seek) st.manual -= Math.floor(st.manual);
    if (busy && st.visible && !st.destroyed) st.raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (st.raf || st.destroyed || !st.visible) return;
    st.last = 0;
    st.raf = requestAnimationFrame(frame);
  };

  const local = (e) => {
    const r = root.getBoundingClientRect();
    const k = root.offsetWidth ? r.width / root.offsetWidth || 1 : 1;
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
  };

  const dragRate = () => {
    if (!st.lut || !st.scale) return 0;
    const a = sample(st.front - 3 / SAMPLES);
    const b = sample(st.front + 3 / SAMPLES);
    const along = ((b[0] - a[0]) / (6 / SAMPLES)) * st.scale;
    const floor = st.length * st.scale * 0.35;
    return Math.abs(along) < floor ? Math.sign(along || 1) * floor : along;
  };

  const itemIndex = (target) => {
    const el = target instanceof Element ? target.closest('[data-orbit-item]') : null;
    return el && root.contains(el) ? Number(el.getAttribute('data-orbit-item')) : -1;
  };

  const bringToFront = (index) => {
    if (!st.lut || index < 0) return;
    const u = progress() + offsetOf(index, st.items.length);
    const delta = wrapSigned(st.front - u);
    st.glide = 0;
    st.seek = { from: st.manual, delta, t: 0, dur: 0.45 + Math.abs(delta) * 1.4 };
    wake();
  };

  const onEnter = () => { st.hovered = true; wake(); };
  const onLeave = () => { st.hovered = false; st.hoverIndex = -1; wake(); };

  const onOver = (e) => {
    const index = itemIndex(e.target);
    if (index !== st.hoverIndex) {
      st.hoverIndex = index;
      if (st.lut) render(performance.now());
    }
  };

  const onDown = (e) => {
    const cfg = config.current;
    if (!cfg.draggable || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (e.target instanceof Element && e.target.closest('[data-orbit-center]')) return;
    const [x, y] = local(e);
    st.drag = { id: e.pointerId, x, y, active: false, samples: [], rate: dragRate(), anchor: 0, manual: 0 };
  };

  const onMove = (e) => {
    const d = st.drag;
    if (!d || e.pointerId !== d.id) return;
    const [x, y] = local(e);
    const along = x - d.x;
    if (!d.active) {
      if (Math.abs(along) < DRAG_THRESHOLD) return;
      if (Math.abs(y - d.y) > Math.abs(along)) {
        st.drag = null;
        return;
      }
      d.active = true;
      d.anchor = along;
      d.manual = st.manual;
      st.seek = null;
      st.glide = 0;
      try { root.setPointerCapture(e.pointerId); } catch { /* sem captura */ }
      root.setAttribute('data-dragging', '');
    }
    if (d.rate) st.manual = d.manual + (along - d.anchor) / d.rate;
    const now = performance.now();
    d.samples.push([now, along]);
    while (d.samples.length > 2 && now - d.samples[0][0] > 100) d.samples.shift();
    wake();
  };

  const endDrag = (e, cancelled) => {
    const d = st.drag;
    if (!d || e.pointerId !== d.id) return;
    st.drag = null;
    if (!d.active) return;
    root.removeAttribute('data-dragging');
    try { root.releasePointerCapture(e.pointerId); } catch { /* sem captura */ }
    const now = performance.now();
    st.suppressUntil = now + 400;
    const s = d.samples;
    if (!cancelled && s.length > 1 && d.rate) {
      const [t0, a0] = s[0];
      const [t1, a1] = s[s.length - 1];
      if (t1 > t0 && now - t1 < 80) st.glide = clamp((((a1 - a0) / (t1 - t0)) * 1000) / d.rate, -3, 3);
    }
    wake();
  };

  const onUp = (e) => endDrag(e, false);
  const onCancel = (e) => endDrag(e, true);

  const activate = (index) => {
    const cfg = config.current;
    if (index < 0) return;
    if (cfg.clickToFront) bringToFront(index);
    cfg.onItemClick?.(index);
  };

  const onClick = (e) => {
    if (performance.now() < st.suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
      st.suppressUntil = 0;
      return;
    }
    activate(itemIndex(e.target));
  };

  const onKey = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const index = itemIndex(e.target);
    if (index < 0) return;
    e.preventDefault();
    activate(index);
  };

  const onFocus = (e) => {
    const index = itemIndex(e.target);
    if (index >= 0 && config.current.clickToFront && e.target instanceof Element && e.target.matches(':focus-visible')) {
      bringToFront(index);
    }
  };

  const onMotion = () => { st.reduced = !!query?.matches; wake(); };

  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointerleave', onLeave);
  root.addEventListener('pointerover', onOver);
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  root.addEventListener('pointercancel', onCancel);
  root.addEventListener('lostpointercapture', onCancel);
  root.addEventListener('click', onClick);
  root.addEventListener('keydown', onKey);
  root.addEventListener('focusin', onFocus);
  query?.addEventListener?.('change', onMotion);

  const resizeObserver = new ResizeObserver(() => {
    layout();
    render(performance.now());
    wake();
  });
  resizeObserver.observe(root);

  const intersection = new IntersectionObserver((entries) => {
    st.visible = entries[entries.length - 1].isIntersecting;
    if (st.visible) wake();
  }, { threshold: 0.05 });
  intersection.observe(root);

  const onVisibility = () => { if (!document.hidden) wake(); };
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', wake);

  const refresh = () => {
    collect();
    build();
    layout();
    render(performance.now());
    wake();
  };

  return { refresh, wake };
};

/* Monta a órbita dentro de `host`.
   items: [{ node, label }] — node é o elemento mostrado em cada posição. */
export function createOrbitImages(host, {
  items = [],
  baseWidth = 1400,
  radiusX = 700,
  radiusY = 170,
  rotation = -8,
  duration = 40,
  itemSize = 64,
  direction = 'normal',
  showPath = false,
  pathColor = 'rgba(128,128,128,0.35)',
  pathWidth = 2,
  pathDash = 0,
  paused = false,
  depth = 0.5,
  itemRadius = 12,
  shadow = 0.3,
  hoverScale = 1.08,
  hoverSpeed = 0.3,
  draggable = true,
  clickToFront = true,
  onItemClick,
  intro = true,
  centerContent,
  className = ''
} = {}) {
  const center = baseWidth / 2;
  const d = ellipsePath(center, center, radiusX, radiusY);
  const layered = depth > 0 && !!centerContent;

  const root = document.createElement('div');
  root.className = `orbit-container ${className}`.trim();
  root.style.width = '100%';
  root.style.aspectRatio = String((radiusX * 2 + itemSize * 1.6) / (radiusY * 2 + itemSize * 1.6));
  root.style.setProperty('--orbit-radius', `${(itemRadius / Math.max(1, itemSize)) * 100}%`);
  root.style.setProperty('--orbit-shadow', String(clamp(shadow, 0, 1)));
  root.style.setProperty('--orbit-hover-scale', String(hoverScale));
  if (intro) root.setAttribute('data-intro', '');
  if (draggable) root.setAttribute('data-draggable', '');

  const svgEl = (name, attrs) => {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };
  const stroke = () => svgEl('path', {
    'data-orbit-stroke': '', d, fill: 'none', stroke: pathColor,
    'stroke-linecap': 'round', transform: `rotate(${rotation} ${center} ${center})`
  });

  const back = svgEl('svg', { class: 'orbit-path-svg', 'data-orbit-svg': '', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  back.style.zIndex = '0';
  if (!showPath) back.style.visibility = 'hidden';
  const mainPath = stroke();
  mainPath.setAttribute('data-orbit-path', '');
  back.append(mainPath);
  root.append(back);

  if (showPath && layered) {
    const id = `orbit-clip-${(clipCount += 1)}`;
    const front = svgEl('svg', { class: 'orbit-path-svg', 'data-orbit-svg': '', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    front.style.zIndex = '105';
    const defs = svgEl('defs', {});
    const clip = svgEl('clipPath', { id, clipPathUnits: 'userSpaceOnUse' });
    clip.append(svgEl('rect', { 'data-orbit-clip': '' }));
    defs.append(clip);
    const g = svgEl('g', { 'clip-path': `url(#${id})` });
    g.append(stroke());
    front.append(defs, g);
    root.append(front);
  }

  items.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'orbit-item';
    el.setAttribute('data-orbit-item', String(index));
    if (clickToFront || onItemClick) el.setAttribute('data-clickable', '');
    if (onItemClick) {
      el.setAttribute('role', 'button');
      el.tabIndex = 0;
      el.setAttribute('aria-label', item.label);
    }
    const inner = document.createElement('div');
    inner.className = 'orbit-item-inner';
    inner.append(item.node);
    el.append(inner);
    root.append(el);
  });

  if (centerContent) {
    const c = document.createElement('div');
    c.className = 'orbit-center-content';
    c.setAttribute('data-orbit-center', '');
    c.append(centerContent);
    root.append(c);
  }

  host.append(root);

  const config = {
    current: {
      baseWidth, rotation, duration, itemSize, direction, pathWidth, pathDash, paused,
      depth, hoverScale, hoverSpeed, draggable, clickToFront, onItemClick, intro
    }
  };
  const engine = createEngine(root, config, (aspect) => {
    root.style.aspectRatio = String(aspect);
  });
  engine.refresh();
  return { root, refresh: engine.refresh };
}
