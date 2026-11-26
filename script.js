/* =====================================================================
   SERVICIO EXPRÉS PLUS · script.js
   Todo es mejora progresiva: el contenido se ve completo sin este archivo.
   ===================================================================== */

// Único lugar donde vive el número de WhatsApp (formato internacional sin "+").
const WHATSAPP = "528144296141";
// Segundo teléfono (solo llamadas): se usa en la tarjeta de contacto (.vcf).
const TEL2 = "525547763769";

(function () {
  'use strict';
  window.__SEP = 1; // avisa al rescate del <head> que el script sí arrancó

  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mq = (q) => window.matchMedia(q);
  const RM = mq('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = mq('(hover: none)').matches;
  const vh = () => window.innerHeight;
  const vw = () => window.innerWidth;
  const waURL = (msg) => 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);

  /* ---------- Engranes: genera el trazo de cada <path data-gear="dientes rExt rInt rHueco"> ---------- */
  function gearD(n, ro, ri, rh) {
    const s = Math.PI * 2 / n, f = (v) => v.toFixed(1);
    let dd = '', first = null;
    for (let i = 0; i < n; i++) {
      const a = i * s;
      const P = [[a - s * .3, ri], [a - s * .17, ro], [a + s * .17, ro], [a + s * .3, ri]]
        .map(([t, r]) => [f(Math.cos(t) * r), f(Math.sin(t) * r)]);
      if (i === 0) { first = P[0]; dd += 'M' + P[0].join(' '); }
      else dd += 'A' + ri + ' ' + ri + ' 0 0 1 ' + P[0].join(' ');
      dd += 'L' + P[1].join(' ') + 'L' + P[2].join(' ') + 'L' + P[3].join(' ');
    }
    dd += 'A' + ri + ' ' + ri + ' 0 0 1 ' + first.join(' ') + 'Z';
    dd += 'M' + rh + ' 0A' + rh + ' ' + rh + ' 0 1 0 ' + (-rh) + ' 0A' + rh + ' ' + rh + ' 0 1 0 ' + rh + ' 0Z';
    return dd;
  }
  $$('[data-gear]').forEach((p) => {
    const [n, ro, ri, rh] = p.dataset.gear.split(/\s+/).map(Number);
    p.setAttribute('d', gearD(n, ro, ri, rh));
    p.setAttribute('fill-rule', 'evenodd');
  });

  /* ---------- Año y enlaces de WhatsApp ---------- */
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  $$('[data-wa]').forEach((a) => {
    if (!WHATSAPP) { a.hidden = true; return; }
    a.href = waURL(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  if (!WHATSAPP) { const f = $('#fab'); if (f) f.hidden = true; }

  /* ---------- Cargador ---------- */
  (function loader() {
    const L = $('#loader');
    const done = () => { root.classList.remove('loading'); root.classList.add('ready'); if (L) L.remove(); };
    if (!L) { done(); return; }
    if (RM) { setTimeout(done, 120); return; }
    const num = $('#ldNum'), st = $('#ldState');
    const set = (v) => {
      const n = Math.round(clamp(v, 0, 100));
      num.textContent = String(n).padStart(2, '0');
      st.textContent = n < 40 ? 'Encendiendo…' : (n < 95 ? 'Calibrando…' : 'Listo ✓');
    };
    if (window.anime) {
      const o = { v: 0 };
      window.anime({ targets: o, v: 100, duration: 1700, easing: 'easeInOutCubic', update: () => set(o.v) });
    } else {
      const t0 = performance.now();
      (function f(t) {
        const p = clamp((t - t0) / 1700);
        set(100 * (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2));
        if (p < 1) requestAnimationFrame(f);
      })(t0);
    }
    setTimeout(() => set(100), 1750);
    setTimeout(done, 2400);
  })();

  /* ---------- Titular del hero: letras con escalón + palabra rotativa ---------- */
  (function heroTitle() {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(d.createTextNode(' ')); return; }
            const w = d.createElement('span'); w.className = 'wd';
            Array.from(tok).forEach((ch) => {
              const s = d.createElement('span'); s.className = 'ch';
              s.style.setProperty('--i', i++); s.textContent = ch; w.appendChild(s);
            });
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    $$('.split').forEach(walk);

    const list = $('#rotList');
    if (!list || RM) return;
    const n = list.children.length - 1;
    let k = 0;
    setInterval(() => {
      if (d.hidden) return;
      k++;
      list.style.transition = 'transform .7s cubic-bezier(.7,0,.2,1)';
      list.style.transform = 'translateY(' + (-k * 1.14) + 'em)';
      list.classList.remove('tick'); void list.offsetWidth; list.classList.add('tick');
      if (k === n) {
        setTimeout(() => { list.style.transition = 'none'; k = 0; list.style.transform = 'translateY(0)'; }, 740);
      }
    }, 2200);
  })();

  /* ---------- Revelado al scroll (con respaldos por geometría) ---------- */
  (function reveal() {
    const els = $$('.rv,.rvh,.tile');
    const show = (e) => e.classList.add('in');
    if (RM || !('IntersectionObserver' in window)) { els.forEach(show); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.01, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
    const geo = () => {
      const h = vh();
      els.forEach((e) => {
        if (e.classList.contains('in')) return;
        if (e.getBoundingClientRect().top < h * 0.94) show(e);
      });
    };
    let q = false;
    const sch = () => { if (q) return; q = true; requestAnimationFrame(() => { q = false; geo(); }); };
    addEventListener('scroll', sch, { passive: true });
    addEventListener('resize', sch);
    setTimeout(geo, 2000);
    setTimeout(geo, 4000);
    addEventListener('load', () => setTimeout(geo, 300));
  })();

  /* ---------- Header, barra de progreso y menú ---------- */
  const hdr = $('#hdr'), prog = $('#prog'), burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    d.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('[data-close]', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (vw() >= 1100) setMenu(false); });

  /* ---------- Chispas del hero (canvas) ---------- */
  (function sparks() {
    const c = $('#sparks'); if (!c || !c.getContext) return;
    const hero = $('#inicio'), ctx = c.getContext('2d');
    let W = 0, H = 0, dpr = 1, ps = [], run = false, raf = 0;
    const mouse = { x: -999, y: -999 };
    const mk = (init) => {
      const yel = Math.random() < .6;
      return { x: Math.random() * W, y: init ? Math.random() * H : H + 12,
        vx: .12 + Math.random() * .4, vy: -(.2 + Math.random() * .6),
        r: 1 + Math.random() * 1.7, c: yel ? '255,214,10' : '170,200,255' };
    };
    const size = () => {
      const r = c.parentElement.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const N = vw() < 700 ? 35 : 70;
      ps = Array.from({ length: N }, () => mk(true));
    };
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 0.1) { const f = (130 - dist) / 130 * 3.2; p.x += dx / dist * f; p.y += dy / dist * f; }
        if (p.y < -12 || p.x > W + 12) { Object.assign(p, mk(false)); p.x = Math.random() * W * .9; }
      }
      for (let i = 0; i < ps.length; i++) {
        const a = ps[i];
        for (let j = i + 1; j < ps.length; j++) {
          const b = ps[j], dd = Math.hypot(a.x - b.x, a.y - b.y);
          if (dd < 110) {
            ctx.strokeStyle = 'rgba(170,200,255,' + ((1 - dd / 110) * .32).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of ps) {
        ctx.beginPath(); ctx.fillStyle = 'rgba(' + p.c + ',.9)';
        ctx.shadowColor = 'rgba(' + p.c + ',.8)'; ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      ctx.shadowBlur = 0;
    };
    const loop = () => { if (!run) return; draw(); raf = requestAnimationFrame(loop); };
    const start = () => { if (run || RM) return; run = true; loop(); };
    const stop = () => { run = false; cancelAnimationFrame(raf); };
    size();
    if (RM) { draw(); }
    addEventListener('resize', () => { size(); if (RM) draw(); });
    hero.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !d.hidden ? start() : stop()))).observe(hero);
    } else start();
    d.addEventListener('visibilitychange', () => { if (d.hidden) stop(); else { const r = hero.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh()) start(); } });
  })();

  /* ---------- Orbe del hero: paralaje con puntero / giroscopio + etiqueta rotativa ---------- */
  const orb = (function () {
    const stage = $('#orbStage'), hero = $('#inicio'), tag = $('#orbTag');
    if (!stage) return { step() {} };
    const st = { tx: 0, ty: 0, x: 0, y: 0, last: 0 };
    if (!TOUCH && !RM) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        st.tx = clamp(((e.clientX - r.left) / r.width - .5) * 2, -1, 1);
        st.ty = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1, 1);
        st.last = performance.now();
      });
      hero.addEventListener('pointerleave', () => { st.last = 0; });
    }
    if (window.DeviceOrientationEvent && TOUCH && !RM) {
      addEventListener('deviceorientation', (e) => {
        if (e.gamma == null) return;
        st.tx = clamp(e.gamma / 25, -1, 1);
        st.ty = clamp((e.beta - 45) / 25, -1, 1);
        st.last = performance.now();
      }, { passive: true });
    }
    if (tag && !RM) {
      const L = ['REVISANDO…', 'PROBANDO…', 'LISTO ✓']; let i = 0;
      setInterval(() => { i = (i + 1) % 3; tag.textContent = L[i]; }, 1500);
    }
    return {
      step(t) {
        if (RM) return;
        // sin puntero: deriva suave constante
        if (!st.last || performance.now() - st.last > 2500) {
          st.tx = Math.sin(t / 2600) * .35; st.ty = Math.cos(t / 3100) * .25;
        }
        st.x = lerp(st.x, st.tx, .06); st.y = lerp(st.y, st.ty, .06);
        stage.style.setProperty('--mx', st.x.toFixed(3));
        stage.style.setProperty('--my', st.y.toFixed(3));
      }
    };
  })();

  /* ---------- Tilt 3D + brillo que sigue al puntero ([data-tilt]) ---------- */
  if (!TOUCH && !RM) {
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 10).toFixed(2) + 'deg');
        el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- S1 · Cinta doble: velocidad ligada al scroll ---------- */
  const ticker = (function () {
    const tracks = $$('.tk-track').map((el) => ({ el, dir: Number(el.dataset.dir) || 1, pos: 0, w: 0 }));
    if (!tracks.length || RM) return { step() {}, measure() {} };
    const measure = () => tracks.forEach((t) => { t.w = t.el.scrollWidth / 2; });
    measure();
    tracks.forEach((t) => { t.el.style.animation = 'none'; });
    return {
      measure,
      step(dt, vel) {
        const boost = Math.min(Math.abs(vel) * .5, 900);
        tracks.forEach((t) => {
          if (!t.w) return;
          t.pos += t.dir * (55 + boost) * dt;
          t.pos = ((t.pos % t.w) + t.w) % t.w;
          t.el.style.transform = 'translate3d(' + (-t.pos).toFixed(1) + 'px,0,0)';
        });
      }
    };
  })();

  /* ---------- S2 · Manifiesto: palabras que se encienden con el scroll ---------- */
  const mani = (function () {
    const sec = $('#manifiesto'), h = $('#mani-t'), track = $('#maniTrack'), mk = $('.mk', h || d);
    if (!sec || !h || RM) return { work() {} };
    const words = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((tok) => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(d.createTextNode(' ')); return; }
            const s = d.createElement('span'); s.className = 'w'; s.textContent = tok;
            words.push(s); frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(h);
    sec.classList.add('mani-ready');
    let lit = -1;
    return {
      work() {
        const r = track.getBoundingClientRect();
        const span = r.height - vh();
        if (span <= 0) { words.forEach((w) => w.classList.add('on')); mk && mk.classList.add('on'); return; }
        const p = clamp(-r.top / span);
        const n = Math.round(clamp((p - .03) / .78) * words.length);
        if (n !== lit) { lit = n; words.forEach((w, i) => w.classList.toggle('on', i < n)); }
        if (mk) mk.classList.toggle('on', p > .88);
      }
    };
  })();

  /* ---------- S3 · Catálogo: pista horizontal anclada al scroll ---------- */
  const cat = (function () {
    const sec = $('#catalogo'), pin = $('#catPin'), vp = $('#catVp'), track = $('#catTrack'),
      bar = $('#catBar'), num = $('#catNum');
    if (!sec) return { layout() {}, work() {}, step() {} };
    const cards = $$('.card', track);
    let pinned = false, maxX = 0, target = 0, cur = 0, prog = 0, near = true, active = -1;
    const canPin = () => !RM && mq('(min-width:1024px)').matches;
    function layout() {
      if (canPin()) {
        sec.classList.add('is-pinned');
        maxX = Math.max(0, track.offsetWidth - vw());
        if (maxX > 0) { pinned = true; pin.style.height = (maxX + vh()) + 'px'; }
        else { pinned = false; sec.classList.remove('is-pinned'); pin.style.height = ''; }
      } else {
        pinned = false; sec.classList.remove('is-pinned'); pin.style.height = ''; track.style.transform = ''; cur = 0;
      }
    }
    function setActive(i) {
      if (i === active) return; active = i;
      cards.forEach((c, k) => c.classList.toggle('is-on', k === i));
      if (num) num.textContent = String(Math.min(i + 1, 8)).padStart(2, '0');
    }
    function work() {
      const r = sec.getBoundingClientRect();
      near = r.bottom > -200 && r.top < vh() + 200;
      if (pinned) {
        const pr = pin.getBoundingClientRect();
        prog = clamp(-pr.top / Math.max(1, pr.height - vh()));
        target = prog * maxX;
      } else {
        const m = vp.scrollWidth - vp.clientWidth;
        prog = m > 0 ? clamp(vp.scrollLeft / m) : 0;
      }
      if (bar) bar.style.transform = 'scaleX(' + prog.toFixed(4) + ')';
    }
    function step() {
      if (pinned) {
        cur = lerp(cur, target, .11);
        if (Math.abs(cur - target) < .1) cur = target;
        track.style.transform = 'translate3d(' + (-cur).toFixed(2) + 'px,0,0)';
      }
      if (!near) return;
      const mid = vw() / 2; let best = 0, bd = 1e9;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid);
        if (dd < bd) { bd = dd; best = i; }
      });
      setActive(best);
    }
    vp.addEventListener('scroll', () => { dirty = true; }, { passive: true });
    return { layout, work, step };
  })();

  /* ---------- S4 · Pre-diagnóstico con ticket que se imprime ---------- */
  (function diag() {
    const SYM = {
      'Refrigerador': ['No enfría', 'Hace ruido', 'Tira agua'],
      'Estufa': ['No enciende', 'Flama irregular', 'Perillas dañadas'],
      'Lavadora': ['No centrifuga', 'No desagua', 'Hace ruido'],
      'Horno': ['No calienta', 'Calienta de más', 'Puerta floja'],
      'Lavavajillas': ['No lava bien', 'No desagua', 'Pierde agua'],
      'Centro de lavado': ['No lava', 'No seca', 'No enciende'],
      'Microondas': ['No calienta', 'Chispea', 'Plato inmóvil'],
      'Vitrina enfriadora': ['No enfría', 'Escarcha', 'Ruido en el motor']
    };
    const eqBox = $('#eqOpts'), symBox = $('#symOpts'), step2 = $('#step2');
    if (!eqBox) return;
    const urg = $('#dgUrg'), col = $('#dgCol'), send = $('#diagSend'), ticket = $('#ticket');
    const tkEq = $('#tkEq'), tkSym = $('#tkSym'), tkPri = $('#tkPri'), tkCol = $('#tkCol'),
      tkColRow = $('#tkColRow'), tkDate = $('#tkDate'), tkEmpty = $('#tkEmpty');
    const S = { eq: '', sym: '', urg: false, col: '' };
    const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

    const msg = () => {
      let m = 'Hola, necesito servicio técnico a domicilio.';
      if (S.eq) m += ' Equipo: ' + S.eq + '.';
      if (S.sym) m += ' Falla: ' + S.sym + '.';
      m += ' Prioridad: ' + (S.urg ? 'URGENTE' : 'normal') + '.';
      if (S.col) m += ' Colonia: ' + S.col + '.';
      return m;
    };
    const setVal = (el, v, empty) => { el.textContent = v || empty; el.classList.toggle('is-empty', !v); };
    function render(print) {
      setVal(tkEq, S.eq, '—'); setVal(tkSym, S.sym, '—');
      tkPri.textContent = S.urg ? 'Urgente' : 'Normal'; tkPri.classList.toggle('is-urg', S.urg);
      tkColRow.hidden = !S.col; tkCol.textContent = S.col;
      tkDate.textContent = fecha;
      tkEmpty.hidden = !!S.eq;
      if (WHATSAPP) send.href = waURL(msg());
      if (print && !RM) { ticket.classList.remove('print'); void ticket.offsetWidth; ticket.classList.add('print'); }
    }
    eqBox.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b) return;
      $$('.opt', eqBox).forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      S.eq = b.dataset.eq; S.sym = '';
      step2.classList.remove('is-off');
      symBox.innerHTML = '';
      SYM[S.eq].concat(['Otra falla']).forEach((s) => {
        const o = d.createElement('button'); o.type = 'button'; o.className = 'opt'; o.setAttribute('aria-pressed', 'false'); o.textContent = s;
        o.dataset.sym = s === 'Otra falla' ? 'Otra falla (la describo por WhatsApp)' : s;
        symBox.appendChild(o);
      });
      render(true);
    });
    symBox.addEventListener('click', (e) => {
      const b = e.target.closest('.opt'); if (!b) return;
      $$('.opt', symBox).forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
      S.sym = b.dataset.sym; render(true);
    });
    urg.addEventListener('change', () => { S.urg = urg.checked; render(true); });
    col.addEventListener('input', () => { S.col = col.value.trim(); render(false); });
    col.addEventListener('change', () => render(true));
    send.addEventListener('click', (e) => {
      if (!WHATSAPP) { e.preventDefault(); return; }
      if (!S.eq) {
        e.preventDefault();
        const st1 = eqBox.closest('.step');
        st1.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' });
        eqBox.animate && eqBox.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 400 });
        return;
      }
      send.href = waURL(msg()); send.target = '_blank'; send.rel = 'noopener noreferrer';
    });
    if (!WHATSAPP) send.hidden = true;
    render(false);
  })();

  /* ---------- S5 · Mapa: ruta que se dibuja y camioneta que la recorre ---------- */
  const map = (function () {
    const sec = $('#domicilio'), route = $('#route'), van = $('#van');
    if (!sec || !route || !van || !route.getTotalLength) return { work() {}, step() {} };
    const L = route.getTotalLength();
    let target = 1, cur = 1, init = false;
    route.style.strokeDasharray = L; // sustituye el punteado estático por el trazo animable
    function apply(p) {
      route.style.strokeDashoffset = (L * (1 - p)).toFixed(1);
      const pt = route.getPointAtLength(L * p), pt2 = route.getPointAtLength(Math.min(L, L * p + 2));
      const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
      van.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    }
    return {
      work() {
        const r = sec.getBoundingClientRect();
        const sp = clamp((vh() - r.top) / (vh() + r.height));
        target = RM ? 1 : clamp((sp - .22) / .48);
        if (!init) { init = true; cur = target; apply(cur); }
      },
      step() {
        if (!init || Math.abs(cur - target) < .0005) return;
        cur = lerp(cur, target, .1); apply(cur);
      }
    };
  })();

  /* ---------- S6 · Proceso: línea que se llena + engrane gigante ---------- */
  const proc = (function () {
    const sec = $('#proceso'), list = $('#stepsP'), fill = $('#lineFill'), gear = $('#bigGear');
    if (!sec) return { work() {} };
    const nodes = $$('.node', list);
    return {
      work() {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh() + 100) return;
        if (gear && !RM) gear.style.transform = 'rotate(' + (window.scrollY * .25).toFixed(2) + 'deg)';
        if (RM) return;
        const lr = list.getBoundingClientRect(), line = vh() * .62;
        fill.style.transform = 'scaleY(' + clamp((line - lr.top) / lr.height).toFixed(4) + ')';
        nodes.forEach((n) => { n.classList.toggle('on', n.getBoundingClientRect().top + 20 < line); });
      }
    };
  })();

  /* ---------- S8 · Tarjeta 3D que se endereza con el scroll y sigue al puntero ---------- */
  const dcard = (function () {
    const el = $('#dc'), stage = el && el.parentElement;
    if (!el || RM) return { work() {}, step() {} };
    const S = { base: { ry: -28, rx: 8 }, ox: 0, oy: 0, tx: 0, ty: 0, ry: -28, rx: 8, hover: false, hx: 50, hy: 50, ho: .35 };
    if (!TOUCH) {
      stage.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = clamp((e.clientX - r.left) / r.width, -.2, 1.2), py = clamp((e.clientY - r.top) / r.height, -.2, 1.2);
        S.ox = (px - .5) * 24; S.oy = (.5 - py) * 18; S.hover = true; S.hx = px * 100; S.hy = py * 100;
      });
      stage.addEventListener('pointerleave', () => { S.ox = 0; S.oy = 0; S.hover = false; });
    }
    return {
      work() {
        const r = el.getBoundingClientRect();
        const p = clamp((vh() - r.top) / (vh() / 2 + r.height / 2));
        S.base.ry = -28 * (1 - p); S.base.rx = 8 * (1 - p);
      },
      step() {
        S.ry = lerp(S.ry, S.base.ry + S.ox, .1); S.rx = lerp(S.rx, S.base.rx + S.oy, .1);
        S.ho = lerp(S.ho, S.hover ? .8 : .3, .08);
        el.style.transform = 'rotateY(' + S.ry.toFixed(2) + 'deg) rotateX(' + S.rx.toFixed(2) + 'deg)';
        el.style.setProperty('--px', S.hx.toFixed(1) + '%'); el.style.setProperty('--py', S.hy.toFixed(1) + '%');
        el.style.setProperty('--ho', S.ho.toFixed(3));
      }
    };
  })();

  /* ---------- S8 · Guardar contacto (.vcf) ---------- */
  (function vcf() {
    const b = $('#vcfBtn'); if (!b) return;
    b.addEventListener('click', () => {
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:Servicio Exprés Plus', 'N:;Servicio Exprés Plus;;;',
        'ORG:Servicio Exprés Plus', 'TITLE:Servicio técnico de línea blanca a domicilio'];
      if (WHATSAPP) lines.push('TEL;TYPE=CELL,VOICE:+' + WHATSAPP);
      if (TEL2) lines.push('TEL;TYPE=CELL,VOICE:+' + TEL2);
      lines.push('NOTE:Tu línea blanca en las mejores manos. Servicio a domicilio y trabajos urgentes.', 'END:VCARD');
      const blob = new Blob([lines.join('\r\n')], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = d.createElement('a'); a.href = url; a.download = 'servicio-expres-plus.vcf';
      d.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
  })();

  /* ---------- S9 · FAQ con animación de altura ---------- */
  (function faq() {
    const all = $$('.faq details');
    const close = (dt) => { dt.classList.remove('is-open'); setTimeout(() => { if (!dt.classList.contains('is-open')) dt.open = false; }, RM ? 0 : 480); };
    all.forEach((dt) => {
      $('summary', dt).addEventListener('click', (e) => {
        e.preventDefault();
        if (dt.open && dt.classList.contains('is-open')) { close(dt); return; }
        all.forEach((o) => { if (o !== dt && o.open) close(o); });
        dt.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => dt.classList.add('is-open')));
      });
    });
  })();

  /* ---------- S10 · Formulario → WhatsApp ---------- */
  (function form() {
    const f = $('#ctForm'); if (!f) return;
    const g = (id) => $('#' + id);
    const rules = { nombre: ['fNombre', 'Cuéntanos tu nombre para saber con quién hablamos.'],
      equipo: ['fEquipo', 'Elige qué equipo necesita ayuda.'],
      falla: ['fFalla', 'Dinos, aunque sea en pocas palabras, qué le pasa.'] };
    const setErr = (k, txt) => {
      const el = $('[data-err="' + k + '"]', f); if (el) el.textContent = txt || '';
      const fld = g(rules[k][0]).closest('.field'); fld.classList.toggle('invalid', !!txt);
    };
    const check = (k) => { const v = g(rules[k][0]).value.trim(); setErr(k, v ? '' : rules[k][1]); return !!v; };
    Object.keys(rules).forEach((k) => {
      const el = g(rules[k][0]);
      el.addEventListener('blur', () => check(k));
      el.addEventListener('input', () => { if (el.closest('.field').classList.contains('invalid')) check(k); });
    });
    if (!WHATSAPP) { const b = $('#fSend'); if (b) b.hidden = true; const n = $('.fc-note', f); if (n) n.hidden = true; }
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!WHATSAPP) return;
      let ok = true, firstBad = null;
      Object.keys(rules).forEach((k) => { if (!check(k)) { ok = false; if (!firstBad) firstBad = g(rules[k][0]); } });
      if (!ok) { firstBad.focus(); return; }
      let m = 'Hola, soy ' + g('fNombre').value.trim() + '. Necesito servicio técnico a domicilio para mi ' + g('fEquipo').value.toLowerCase() + '.';
      m += ' Falla: ' + g('fFalla').value.trim() + '.';
      const col = g('fCol').value.trim(); if (col) m += ' Colonia: ' + col + '.';
      m += ' Prioridad: ' + (g('fUrg').checked ? 'URGENTE' : 'normal') + '.';
      const tel = g('fTel').value.trim(); if (tel) m += ' Mi teléfono: ' + tel + '.';
      const url = waURL(m);
      const w = window.open(url, '_blank', 'noopener');
      if (!w) location.href = url;
    });
  })();

  /* ---------- Footer: palabra gigante que se rellena con el scroll ---------- */
  const ftw = (function () {
    const w = $('#ftWord'); if (!w) return { work() {} };
    return {
      work() {
        if (RM) return;
        const r = w.getBoundingClientRect();
        if (r.top > vh() + 50 || r.bottom < -50) return;
        w.style.setProperty('--p', clamp((vh() - r.top) / (vh() * .55 + r.height)).toFixed(3));
      }
    };
  })();

  /* ---------- Botón flotante: burbuja a los 6 s ---------- */
  (function fab() {
    const b = $('#fabB'); if (!b || !WHATSAPP) return;
    setTimeout(() => { b.classList.add('show'); setTimeout(() => b.classList.remove('show'), 6500); }, 6000);
  })();

  /* ---------- Bucle principal ---------- */
  let dirty = true, lastY = window.scrollY, vel = 0, last = performance.now();
  function scrollWork() {
    const y = window.scrollY, max = Math.max(1, root.scrollHeight - vh());
    hdr.classList.toggle('is-solid', y > 40);
    prog.style.transform = 'scaleX(' + clamp(y / max).toFixed(4) + ')';
    mani.work(); cat.work(); map.work(); proc.work(); dcard.work(); ftw.work();
  }
  function frame(t) {
    const dt = Math.min(.05, Math.max(.001, (t - last) / 1000)); last = t;
    const y = window.scrollY;
    vel = lerp(vel, (y - lastY) / dt, .12); lastY = y;
    if (Math.abs(vel) < 1) vel = 0;
    if (dirty) { dirty = false; scrollWork(); }
    ticker.step(dt, vel); orb.step(t); cat.step(); map.step(); dcard.step();
    requestAnimationFrame(frame);
  }
  function layoutAll() { cat.layout(); ticker.measure(); dirty = true; }
  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  addEventListener('resize', layoutAll);
  addEventListener('load', () => { layoutAll(); setTimeout(layoutAll, 600); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(layoutAll);
  layoutAll();
  requestAnimationFrame(frame);
})();
