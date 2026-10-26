/**
 * The fluid itself: simulation + drawing, with no DOM access, so it runs the same on the main
 * thread or in a worker (fluid-worker.js, on OffscreenCanvases). fluid-field.js is the public API
 * and owns the page side: pointer, scroll, size and visibility.
 *
 *   const core = createFluidCore(options, inkCanvas, dotsCanvas);
 *   core.resize(width, height, pixelRatio, viewportHeight);
 *   const calm = core.frame(scrollY, wake);   // one simulated + drawn frame
 */

export function createFluidCore(o, ink, dots) {
  const gi = ink.getContext('2d'), gd = dots.getContext('2d');
  const S = o.cell;

  let C, R, u, v, u0, v0, pp, dv, dye, dye0, img, warm, W, H, vh = 0, pr = 1;
  const vortex = { a: 0, x: 0, y: 0 };
  const m = { x: -1, y: -1, px: -1, py: -1 };

  function resize(width, height, pixelRatio, viewportHeight) {
    W = width; H = height; pr = pixelRatio; vh = viewportHeight;
    C = Math.ceil(W / S) + 2; R = Math.ceil(H / S) + 2; const n = C * R;
    u = new Float32Array(n); v = new Float32Array(n); u0 = new Float32Array(n); v0 = new Float32Array(n);
    pp = new Float32Array(n); dv = new Float32Array(n); dye = new Float32Array(n); dye0 = new Float32Array(n);
    ink.width = C; ink.height = R; img = gi.createImageData(C, R);
    warm = new Float32Array(Math.ceil(W / o.dotSpacing + 1) * Math.ceil(H / o.dotSpacing + 1) * 4);
    dots.width = W * pr; dots.height = H * pr;
  }

  const ix = (x, y) => (y < 0 ? 0 : y >= R ? R - 1 : y) * C + (x < 0 ? 0 : x >= C ? C - 1 : x);
  function smp(a, x, y) { /* bilinear sample */
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    return (a[ix(x0, y0)] * (1 - fx) + a[ix(x0 + 1, y0)] * fx) * (1 - fy) + (a[ix(x0, y0 + 1)] * (1 - fx) + a[ix(x0 + 1, y0 + 1)] * fx) * fy;
  }
  /* add force (fx,fy) and ink d in a gaussian of radius rad cells around (px,py) in canvas pixels */
  function splat(px, py, fx, fy, rad, d) {
    const gx = px / S + 1, gy = py / S + 1, r = Math.ceil(rad * 1.6);
    for (let y = Math.floor(gy - r); y <= gy + r; y++) for (let x = Math.floor(gx - r); x <= gx + r; x++) {
      if (x < 1 || y < 1 || x >= C - 1 || y >= R - 1) continue;
      const dx = x - gx, dy = y - gy, w = Math.exp(-(dx * dx + dy * dy) / (rad * rad)), i = y * C + x;
      u[i] += fx * w; v[i] += fy * w; dye[i] = Math.min(1.6, dye[i] + d * w);
    }
  }

  let lastSY = 0;
  function step(scrollY) {
    let dsy = 0;
    if (o.scrollDrift) { dsy = scrollY - lastSY; lastSY = scrollY; if (Math.abs(dsy) > vh) dsy = 0; }
    if (m.px >= 0 && m.x >= 0) {
      const dx = m.x - m.px, dy = m.y - m.py, sp = Math.sqrt(dx * dx + dy * dy);
      if (sp > 0.3) splat(m.x, m.y, (dx / S) * o.pointerForce, (dy / S) * o.pointerForce, 2.3, Math.min(0.7, sp * o.pointerInk));
    }
    m.px = m.x; m.py = m.y;
    if (vortex.a > 0.01) { /* swirl around a point, used for press-and-hold */
      const gx = vortex.x / S + 1, gy = vortex.y / S + 1, rr = 10;
      for (let y = Math.max(1, Math.floor(gy - rr)); y < Math.min(R - 1, gy + rr); y++) for (let x = Math.max(1, Math.floor(gx - rr)); x < Math.min(C - 1, gx + rr); x++) {
        const ddx = x - gx, ddy = y - gy, w = Math.exp(-(ddx * ddx + ddy * ddy) / 40) * vortex.a, i = y * C + x;
        u[i] += (-ddy * 0.06 - ddx * 0.012) * w; v[i] += (ddx * 0.06 - ddy * 0.012) * w; dye[i] = Math.min(1.4, dye[i] + w * 0.03);
      }
    }
    let i, x, y;
    u0.set(u); v0.set(v); dye0.set(dye);
    /* advect velocity and ink backwards along the flow */
    for (y = 1; y < R - 1; y++) for (x = 1; x < C - 1; x++) { i = y * C + x; const bx = x - u0[i], by = y - v0[i]; u[i] = smp(u0, bx, by); v[i] = smp(v0, bx, by) - dsy * 0.0012; dye[i] = smp(dye0, bx, by) * o.dyeDecay; }
    /* pressure projection keeps the flow divergence-free (swirly, not spreading) */
    for (y = 1; y < R - 1; y++) for (x = 1; x < C - 1; x++) { i = y * C + x; dv[i] = -0.5 * (u[i + 1] - u[i - 1] + v[i + C] - v[i - C]); pp[i] = 0; }
    for (let it = 0; it < o.iterations; it++) for (y = 1; y < R - 1; y++) for (x = 1; x < C - 1; x++) { i = y * C + x; pp[i] = (dv[i] + pp[i - 1] + pp[i + 1] + pp[i - C] + pp[i + C]) * 0.25; }
    for (y = 1; y < R - 1; y++) for (x = 1; x < C - 1; x++) { i = y * C + x; u[i] = (u[i] - 0.5 * (pp[i + 1] - pp[i - 1])) * o.velocityDamping; v[i] = (v[i] - 0.5 * (pp[i + C] - pp[i - C])) * o.velocityDamping; }
  }

  function draw() {
    /* ink: dark ember → brand orange → peach as density rises */
    const d = img.data;
    for (let i = 0; i < C * R; i++) {
      const q = Math.min(1, dye[i]); let r, g, b;
      if (q < 0.5) { const t = q * 2; r = 110 + 145 * t; g = 30 + 77 * t; b = 0; } else { const t = (q - 0.5) * 2; r = 255; g = 107 + 95 * t; b = 150 * t; }
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = Math.min(255, q * 255 * 0.9);
    }
    gi.putImageData(img, 0, 0);
    /* dots: displaced by the local velocity, warmer and bigger where there is ink */
    gd.setTransform(pr, 0, 0, pr, 0, 0); gd.clearRect(0, 0, W, H);
    const sp = o.dotSpacing, ox = (W % sp) / 2, hc = o.dotHotColor;
    /* plain dots share one colour: collected into one path and filled once; only the warm
       dots (under ink) are coloured one by one, on top */
    let nw = 0;
    gd.beginPath();
    for (let y = sp / 2; y < H; y += sp) for (let x = ox; x < W; x += sp) {
      const gx = x / S + 1, gy = y / S + 1, du = smp(u, gx, gy), dvv = smp(v, gx, gy), q = smp(dye, gx, gy);
      const s = 1.4 + Math.min(1, q) * 1.6;
      const dx = x + du * S * 0.8 - s / 2, dy = y + dvv * S * 0.8 - s / 2;
      if (q > 0.08) { warm[nw++] = dx; warm[nw++] = dy; warm[nw++] = s; warm[nw++] = q; }
      else gd.rect(dx, dy, s, s);
    }
    gd.fillStyle = o.dotColor;
    gd.fill();
    for (let i = 0; i < nw; i += 4) {
      gd.fillStyle = 'rgba(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ',' + Math.min(0.9, 0.2 + warm[i + 3] * 0.6) + ')';
      gd.fillRect(warm[i], warm[i + 1], warm[i + 2], warm[i + 2]);
    }
  }

  function settled() {
    if (vortex.a > 0.01) return false;
    for (let i = 0; i < C * R; i++) if (dye[i] > 0.004 || Math.abs(u[i]) > 0.01 || Math.abs(v[i]) > 0.01) return false;
    return true;
  }

  return {
    resize,
    draw,
    /** pointer in canvas pixels; outside the canvas pass (-1, -1) */
    pointer(x, y) { if (x < 0) { m.x = m.px = -1; return; } m.x = x; m.y = y; },
    /** one frame: simulate (unless reduced) and draw. wake: coming out of calm, so the scroll
        position is taken as is rather than as a jump. Returns true once the field is calm. */
    frame(scrollY, wake = false) {
      if (wake) lastSY = scrollY;
      step(scrollY);
      draw();
      return settled();
    },
    clear() { gi.clearRect(0, 0, ink.width, ink.height); gd.clearRect(0, 0, dots.width, dots.height); },
    splash(x, y) { splat(x, y, 0, 0, 2.4, 0.8); },
    burst(x, y, power = 1) { for (let a = 0; a < 28; a++) { const an = (a / 28) * 6.283; splat(x + Math.cos(an) * S * 1.6, y + Math.sin(an) * S * 1.6, Math.cos(an) * power, Math.sin(an) * power, 2.2, 0.55 * Math.min(1, power)); } },
    setVortex(x, y, a) { vortex.x = x; vortex.y = y; vortex.a = a; },
  };
}
