// 0:26.5–1:04：纵身跳河 → 背着行李下潜 → 闪电与光圈 → 产房（剪走行李、擦去记忆）→ 听见妈妈的声音
const { clamp, lerp, ss, easeInOut, easeOut, frac, rng } = require('./engine/lib');
const { W, H, TAU, sheet, P, tornRidge, cloud, person, baby, head } = require('./engine/paper');
const { blink, backOut, popIn, jujube, coin, letter, bundle, scissors, bolt, chip, heart } = require('./engine/props');
const { vbg, overlay, camera, star, STARS, river, water, bubbles, kelp, KELP, fish, rings } = require('./engine/stage');
const { CAST } = require('./cast');

// ---------- 河岸：纵身一跃 ----------
function shotBank(ctx, t) {
  vbg(ctx, '#27345a', '#4b5f86');
  for (const [x, y, s, r] of STARS) star(ctx, x, y, s * (0.85 + 0.15 * Math.sin(t * 3 + x)), r);
  sheet(ctx, P.circle(1560, 170, 70), '#f6e7c0', { blur: 20, shadowA: 0.2 });
  sheet(ctx, P.circle(1592, 150, 60), '#2c3a60', { shadow: false, edge: false }); // 盖掉一块变成月牙
  river(ctx, t, 760, ['#3d7d93', '#2f6c83', '#245b72']);
  sheet(ctx, c => { c.moveTo(-20, H + 20); c.lineTo(-20, 640); c.quadraticCurveTo(500, 600, 880, 690); c.bezierCurveTo(960, 710, 930, 800, 980, H + 20); c.closePath(); }, '#5c7a4a', { blur: 14 });
  sheet(ctx, c => { c.moveTo(-20, H + 20); c.lineTo(-20, 760); c.quadraticCurveTo(400, 730, 700, 820); c.bezierCurveTo(820, 860, 860, 950, 900, H + 20); c.closePath(); }, '#4b6a3d', { blur: 10 });
  for (let i = 0; i < 7; i++) sheet(ctx, P.circle(120 + i * 110, 880 + Math.sin(i * 2) * 30, 10 + (i % 3) * 4), ['#f3d27a', '#f6e7c8', '#e8857a'][i % 3], { blur: 3, sy: 2, edgeW: 1.2 });
  for (let i = 0; i < 9; i++) { const x = 60 + i * 95; sheet(ctx, P.ellipse(x, 640 + Math.sin(i) * 10 - (x > 700 ? (x - 700) * 0.2 : 0), 14, 30, Math.sin(i * 3 + t) * 0.2), '#6f9257', { blur: 4, sy: 2, edgeW: 1.4 }); }
  const jump = clamp((t - 28.0) / 0.45);
  const crouch = ss(27.5, 27.9, t) * (1 - jump);
  let kx = 760, ky = 690 + crouch * 14, rot = 0;
  if (jump > 0) { kx = lerp(760, 1060, jump); ky = 690 - Math.sin(jump * Math.PI) * 160 + jump * jump * 320; rot = jump * 1.4; }
  ctx.save(); ctx.translate(kx, ky - 150); ctx.rotate(rot); ctx.translate(-kx, -(ky - 150));
  bundle(ctx, kx - 95, ky - 205, 150, t);
  person(ctx, { ...CAST.soul, x: kx, y: ky, h: 300, expr: t < 27.55 ? 'calm' : 'o', blink: blink(t, 1), armL: jump > 0 ? 2.6 : 0.2 + crouch * 0.6, armR: jump > 0 ? 2.6 : 0.2 + crouch * 0.6, t });
  ctx.restore();
  const st = t - 28.4;
  if (st > 0) {
    const r = rng(7);
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.2, v = 300 + r() * 300;
      sheet(ctx, P.circle(1080 + Math.cos(a) * v * st, 800 + Math.sin(a) * v * st + 900 * st * st, 8 + r() * 10), '#dff1f4', { blur: 4, sy: 2, edgeW: 1.2 });
    }
  }
}

// ---------- 水下：背着行李往下游 ----------
function swimmer(ctx, x, y, h, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.35);
  bundle(ctx, -h * 0.32, -h * 0.25, h * 0.52, t, { rot: Math.sin(t * 2) * 0.06 });
  const pad = Math.sin(t * 5.5);
  person(ctx, { ...CAST.soul, x: 0, y: h * 0.5, h, expr: o.expr || 'worry', blink: blink(t, 2), armL: o.armL ?? 2.3 + pad * 0.6, armR: o.armR ?? 2.3 - pad * 0.6, walk: t * 9, walkAmt: o.kick ?? 0.9, turn: o.turn || 0, t });
  ctx.restore();
}
function shotSwim(ctx, t) {
  const deep = ss(31.0, 33.0, t);
  water(ctx, t, deep * 0.6);
  // 远处沉在河底的金字塔（呼应“尼罗河”）
  const sandY = lerp(H + 260, 860, easeInOut(deep));
  ctx.save(); ctx.globalAlpha = 0.55 * deep;
  for (const [x, s] of [[300, 260], [560, 180], [1500, 230]]) sheet(ctx, P.poly([[x - s, sandY + 20], [x, sandY - s * 0.9], [x + s, sandY + 20]]), '#3b7f87', { blur: 6, shadowA: 0.1 });
  ctx.restore();
  tornRidge(ctx, x => sandY + Math.sin(x / 200) * 16, '#c9b27a', 55, { blur: 12 });
  for (const k of KELP) kelp(ctx, k, sandY + 30, t);
  const fx = frac((t - 28) * 0.06) * (W + 400) - 200;
  fish(ctx, W - fx, 300 + Math.sin(t) * 20, 34, -1, '#f2a65a');
  fish(ctx, W - fx + 120, 350 + Math.sin(t + 1) * 20, 24, -1, '#f6c46f');
  bubbles(ctx, t);
  const kx = lerp(760, 1060, ss(28.4, 33, t)), ky = 470 + Math.sin(t * 1.4) * 14 + deep * 40;
  swimmer(ctx, kx, ky, 300, t);
  for (let i = 0; i < 3; i++) { const p = frac(t * 0.9 + i / 3); sheet(ctx, P.circle(kx + 60 + p * 30, ky - 120 - p * 160, 6 + p * 6), 'rgba(235,250,252,0.7)', { shadow: false, edgeW: 1.4 }); }
}

// ---------- 闪电与光圈隧道 ----------
function shotTunnel(ctx, t) {
  water(ctx, t, 0.85);
  bubbles(ctx, t, 0.6);
  let shake = 0;
  for (const [tf, x, seed] of [[33.05, 420, 1], [33.75, 1450, 2], [34.3, 760, 3]]) {
    const f = t > tf ? Math.exp(-(t - tf) * 4) : 0;
    if (f > 0.03) { overlay(ctx, '#fff6d8', 0.55 * f); bolt(ctx, x, -20, 560, seed); shake += f; }
  }
  const ra = ss(34.6, 35.6, t);
  const speed = 0.1 + 0.25 * ss(40.0, 41.8, t);
  const z = 1 + 1.6 * Math.pow(ss(40.4, 42.0, t), 2);
  ctx.save();
  ctx.translate(Math.sin(t * 60) * shake * 14, Math.cos(t * 50) * shake * 10);
  camera(ctx, W / 2, H / 2, z);
  rings(ctx, W / 2, H / 2 - 20, t, 34.6, speed, ra);
  const unsure = ss(36.6, 37.0, t) * (1 - ss(40.0, 40.4, t));
  const scared = t < 34.8;
  const kx = W / 2 + Math.sin(t * 0.9) * 30, ky = H / 2 + 60 + Math.sin(t * 1.3) * 12;
  swimmer(ctx, kx, ky, 290, t, {
    rot: lerp(-0.35, 0, ss(34.6, 35.8, t)) + Math.sin(t * 1.1) * 0.05,
    expr: scared ? 'o' : unsure > 0.5 ? 'worry' : 'o',
    armL: scared ? 0.9 : unsure > 0.5 ? 0.4 : 1.2 + Math.sin(t * 2) * 0.2,
    armR: scared ? 0.9 : unsure > 0.5 ? 2.9 + Math.sin(t * 7) * 0.12 : 1.2 - Math.sin(t * 2) * 0.2,
    kick: scared ? 1 : 0.35, turn: Math.sin((t - 36.6) * 2.2) * unsure,
  });
  for (const [t0, dx] of [[37.0, -60], [38.3, 70]]) {
    const p = popIn(t, t0);
    if (p > 0 && t < 40.2) { ctx.save(); ctx.translate(kx + dx + 150, ky - 230); ctx.scale(p, p); chip(ctx, '？', 0, 0, 34, dx * 0.003); ctx.restore(); }
  }
  ctx.restore();
  overlay(ctx, '#fffaf0', ss(41.3, 42.0, t));
}

// ---------- 产房 ----------
function room(ctx, t) {
  vbg(ctx, '#d5ebe4', '#bfdcd3');
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
  for (let x = 0; x < W; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();
  sheet(ctx, P.rrect(1520, 90, 300, 260, 8), '#fdf8ee', { blur: 10, shadowA: 0.2 });
  sheet(ctx, P.rrect(1540, 110, 260, 220, 4), '#b9dff0', { blur: 2, sy: 1 });
  cloud(ctx, 1640, 230, 40, '#fdfaf3', 3);
  sheet(ctx, P.ellipse(W / 2, 40, 330, 120), '#eef0ea', { blur: 16, shadowA: 0.25 });
  for (let i = 0; i < 5; i++) sheet(ctx, P.circle(W / 2 + (i - 2) * 115, 60 + Math.abs(i - 2) * -8, 44), '#fffdf2', { blur: 6, sy: 2 });
  const g = ctx.createRadialGradient(W / 2, 120, 50, W / 2, 400, 900);
  g.addColorStop(0, 'rgba(255,253,240,0.55)'); g.addColorStop(1, 'rgba(255,253,240,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
const TABLE_Y = 800;
function table(ctx) {
  sheet(ctx, P.rrect(380, TABLE_Y, 1160, 70, 14), '#f3eee4', { blur: 14 });
  sheet(ctx, P.rrect(420, TABLE_Y + 66, 1080, 240, 10), '#d9d1c2', { blur: 10 });
  sheet(ctx, P.rrect(420, TABLE_Y + 100, 1080, 20, 4), '#c5bba9', { shadow: false, edgeW: 1 });
}
function doctors(ctx, t, o = {}) {
  const ds = [[560, 42.1, 1], [960, 42.4, 0], [1360, 42.7, -1]];
  ds.forEach(([x, t0, lean], i) => {
    const p = backOut((t - t0) / 0.5);
    if (p <= 0) return;
    const y = lerp(H + 700, H + 340, p) + Math.sin(t * 1.5 + i) * 6;
    const pose = (o.poses && o.poses[i]) || {};
    person(ctx, { ...CAST.doctor, x, y, h: 880, lean: lean * 0.6, expr: pose.expr || 'happy', blink: blink(t, i + 3), armL: pose.armL ?? 0.25, armR: pose.armR ?? 0.25, t });
  });
}
function shotBirth(ctx, t) {
  room(ctx, t);
  const z = 1 + 0.04 * ss(42, 55, t);
  ctx.save(); camera(ctx, W / 2, H / 2 + 60, z);
  const snip = t > 46.3;
  const takeP = easeInOut(ss(46.9, 48.4, t));
  const wipe = ss(48.6, 49.0, t) * (1 - ss(51.2, 51.6, t));
  const poses = [
    { armL: t > 42.6 && t < 44.8 ? 2.4 + Math.sin(t * 9) * 0.3 : 0.25 },
    { armR: wipe > 0 ? 1.7 + Math.sin(t * 9) * 0.25 : 0.25, expr: wipe > 0 ? 'happy' : 'smile' },
    { armR: t > 45 && t < 46.9 ? 1.05 : takeP > 0 && takeP < 1 ? 1.3 : 0.25, expr: 'smile' },
  ];
  doctors(ctx, t, { poses });
  table(ctx);
  const isBaby = t > 52.7;
  const kx = 900, ky = TABLE_Y + 20;
  // 行李与连着它的红绳
  const bx = lerp(1210, 1700, takeP), by = lerp(TABLE_Y - 110, 300, takeP) - Math.sin(takeP * Math.PI) * 120;
  if (takeP < 1) bundle(ctx, bx, by, 140, t, { rot: takeP * 0.6 });
  if (!isBaby) {
    const hand = [kx + 95, ky - 150];
    ctx.save(); ctx.strokeStyle = '#d24f45'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(40,24,18,0.3)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
    const mid = [(hand[0] + bx - 60) / 2, Math.max(hand[1], by) + 40];
    ctx.globalAlpha = 1 - ss(48.2, 48.8, t);
    if (!snip) { ctx.beginPath(); ctx.moveTo(...hand); ctx.quadraticCurveTo(mid[0], mid[1], bx - 60, by - 20); ctx.stroke(); }
    else {
      const fall = Math.min(1, (t - 46.3) * 2);
      ctx.beginPath(); ctx.moveTo(...hand); ctx.quadraticCurveTo(hand[0] + 40, hand[1] + 60 * fall + 20, mid[0] - 10, mid[1] + 90 * fall); ctx.stroke();
      if (takeP < 1) { ctx.beginPath(); ctx.moveTo(bx - 60, by - 20); ctx.quadraticCurveTo(bx - 70, by + 40 * fall, mid[0] + 20, mid[1] + 80 * fall); ctx.stroke(); }
    }
    ctx.restore();
    const crying = t > 46.4 && t < 50.3;
    const expr = t < 44.9 ? 'o' : t < 46.3 ? 'worry' : crying ? 'cry' : t < 51.6 ? 'calm' : 'sleep';
    const reach = crying && takeP < 1 ? 1.5 + Math.sin(t * 6) * 0.15 : 0.35;
    person(ctx, { ...CAST.soul, x: kx, y: ky, h: 300, expr, blink: blink(t, 5), armL: crying ? 0.9 : 0.25, armR: t < 46.3 ? 0.55 : reach, turn: crying ? 0.5 : 0, t });
    // 毛巾擦脑袋
    if (wipe > 0) {
      const wx = kx + Math.sin(t * 9) * 45, wy = ky - 300;
      ctx.save(); ctx.globalAlpha = wipe; ctx.translate(wx, wy); ctx.rotate(Math.sin(t * 9) * 0.15);
      sheet(ctx, c => { c.moveTo(-95, 10); c.quadraticCurveTo(-60, -40, 0, -44); c.quadraticCurveTo(60, -40, 95, 10); c.quadraticCurveTo(50, -6, 0, -4); c.quadraticCurveTo(-50, -6, -95, 10); }, '#fbfbf6', { blur: 8 });
      ctx.strokeStyle = '#8fc4d8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-70, -10); ctx.quadraticCurveTo(0, -38, 70, -10); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 4; i++) { const p = frac(t * 1.5 + i / 4); star(ctx, kx + (i - 1.5) * 70 + Math.sin(i * 7) * 20, wy - 40 - p * 60, 10 * Math.sin(p * Math.PI), p * 3); }
    }
    // 剪刀
    const sa = ss(45.0, 45.3, t) * (1 - ss(46.8, 47.1, t));
    if (sa > 0) {
      const open = t < 46.1 ? 0.35 + Math.sin(t * 8) * 0.12 : 0.35 * (1 - ss(46.1, 46.3, t)) + 0.03;
      ctx.save(); ctx.globalAlpha = sa; scissors(ctx, mid[0] + 30, mid[1] - 40, 110, open, 1.9); ctx.restore();
    }
    if (snip && t < 47) chip(ctx, '咔', mid[0] + 120, mid[1] - 150, 40 * popIn(t, 46.3), 0.2, '#fff4d6', '#d24f45');
  }
  // 记忆从脑袋里飘出去，飞向窗外
  const items = [[49.0, 'j'], [49.5, 'c'], [50.0, 'l'], [50.5, 'j'], [51.0, 'h']];
  items.forEach(([t0, k], i) => {
    const p = clamp((t - t0) / 2.4);
    if (p <= 0 || p >= 1) return;
    const x = lerp(kx, 1660, easeInOut(p)) + Math.sin(p * 9 + i) * 30, y = lerp(ky - 290, 200, easeOut(p)) - Math.sin(p * Math.PI) * 120;
    const s = 1.9 * (1 - p * 0.45) * popIn(t, t0, 0.3);
    ctx.save(); ctx.globalAlpha = 1 - ss(0.75, 1, p); ctx.translate(x, y); ctx.scale(s, s);
    if (k === 'j') jujube(ctx, 0, 0, 22); else if (k === 'c') coin(ctx, 0, 0, 26, t * 5); else if (k === 'l') letter(ctx, 0, 0, 30, Math.sin(t * 3) * 0.3); else heart(ctx, 0, 0, 26);
    ctx.restore();
  });
  // 变成婴儿：一团纸屑
  const pt = t - 52.6;
  if (pt > -0.1 && pt < 1.2) {
    const r = rng(77);
    for (let i = 0; i < 26; i++) {
      const a = r() * TAU, v = 80 + r() * 260, e = easeOut(clamp(pt / 0.9));
      const s = (14 + r() * 26) * (1 - ss(0.5, 1.2, pt)) * clamp(pt * 8 + 1);
      if (s > 0.5) sheet(ctx, P.circle(kx + Math.cos(a) * v * e, ky - 150 + Math.sin(a) * v * e * 0.7, s), ['#fbf6ec', '#f2c6a0', '#f3d27a'][i % 3], { blur: 5, sy: 2 });
    }
  }
  if (isBaby) {
    const bp = backOut((t - 52.75) / 0.4);
    ctx.save(); ctx.translate(kx, ky - 60); ctx.scale(bp, bp);
    baby(ctx, 0, 0, 230, { expr: 'sleep', t, rot: Math.sin(t * 1.2) * 0.02 });
    ctx.restore();
    for (let i = 0; i < 3; i++) { const p = frac((t - 53.2) * 0.45 + i / 3); if (t > 53.2) chip(ctx, 'z', kx - 120 - p * 60, ky - 160 - p * 160, 16 + p * 14, -0.3, '#fbf6ec', '#6f8fb8'); }
  }
  ctx.restore();
  overlay(ctx, '#fffaf0', 1 - ss(42.0, 42.5, t));
  overlay(ctx, '#2a2238', 0.35 * ss(53.6, 55.5, t));
}

// ---------- 听见一个声音：妈妈的怀抱 ----------
function shotVoice(ctx, t) {
  vbg(ctx, '#f4d7c2', '#e9b9a3');
  const z = 1 + 0.05 * ss(55.6, 64, t);
  ctx.save(); camera(ctx, W / 2 + 60, H / 2, z);
  sheet(ctx, P.rrect(120, 90, 520, 600, 10), '#fbefd9', { blur: 14, shadowA: 0.2 });
  ctx.save(); ctx.strokeStyle = '#d9b48f'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(380, 90); ctx.lineTo(380, 690); ctx.moveTo(120, 390); ctx.lineTo(640, 390); ctx.stroke(); ctx.restore();
  const cw = Math.sin(t * 1.3) * 10;
  sheet(ctx, c => { c.moveTo(100, 70); c.quadraticCurveTo(250 + cw, 400, 170, 760); c.lineTo(90, 760); c.closePath(); }, '#e8857a', { blur: 10 });
  sheet(ctx, c => { c.moveTo(660, 70); c.quadraticCurveTo(520 + cw, 400, 600, 760); c.lineTo(680, 760); c.closePath(); }, '#e8857a', { blur: 10 });
  ctx.save(); ctx.globalAlpha = 0.16;
  const lg = ctx.createLinearGradient(380, 90, 1100, 1080); lg.addColorStop(0, '#fffaf0'); lg.addColorStop(1, 'rgba(255,250,240,0)');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(180, 100); ctx.lineTo(600, 100); ctx.lineTo(1300, 1080); ctx.lineTo(600, 1080); ctx.fill(); ctx.restore();
  sheet(ctx, P.rrect(1560, 120, 200, 160, 6), '#c99a6b', { blur: 8 });
  sheet(ctx, P.rrect(1578, 138, 164, 124, 4), '#f3e6cf', { blur: 2, sy: 1 });
  sheet(ctx, P.circle(1630, 190, 22), '#d98b7a', { blur: 2, sy: 1, edgeW: 1.2 }); sheet(ctx, P.circle(1690, 200, 18), '#e7ad55', { blur: 2, sy: 1, edgeW: 1.2 });
  const mx = 1160, my = 360 + Math.sin(t * 1.1) * 5, R = 210;
  sheet(ctx, c => {
    c.moveTo(mx - R * 2.1, H + 40); c.bezierCurveTo(mx - R * 1.9, my + R * 1.4, mx - R * 0.9, my + R * 1.15, mx, my + R * 1.15);
    c.bezierCurveTo(mx + R * 0.9, my + R * 1.15, mx + R * 1.9, my + R * 1.4, mx + R * 2.1, H + 40); c.closePath();
  }, '#efe2cc', { blur: 18 });
  const talking = Math.sin(t * 11) > 0 && t > 56.0 && t < 59.5;
  head(ctx, mx, my, R, { ...CAST.mom, expr: talking ? 'laugh' : 'happy', turn: -0.4, tilt: -0.18 + Math.sin(t * 0.9) * 0.03 });
  const bx = 930, by = 800;
  sheet(ctx, c => { c.moveTo(mx + R * 1.3, my + R * 1.6); c.bezierCurveTo(mx + R * 1.1, by + 120, bx + 200, by + 170, bx - 120, by + 120); c.lineTo(bx - 110, by + 60); c.bezierCurveTo(bx + 180, by + 90, mx + R * 0.6, by + 40, mx + R * 0.75, my + R * 1.5); c.closePath(); }, '#dcc6a3', { blur: 12 });
  const awake = t > 56.4;
  baby(ctx, bx, by, 300, { expr: awake ? 'o' : 'sleep', blink: awake ? blink(t, 7, 2.6) : 0, rot: -0.22 + Math.sin(t * 1.6) * 0.04, t });
  sheet(ctx, c => { c.moveTo(mx - R * 1.5, my + R * 1.5); c.bezierCurveTo(mx - R * 1.6, by + 30, bx + 120, by + 40, bx + 60, by - 20); c.lineTo(bx + 120, by - 40); c.bezierCurveTo(bx + 200, by - 10, mx - R * 1.05, by - 10, mx - R * 1.0, my + R * 1.45); c.closePath(); }, '#e2cba6', { blur: 12 });
  sheet(ctx, P.ellipse(bx + 85 + Math.sin(t * 3.2) * 6, by - 35, 34, 26, -0.4), '#f6d9c0', { blur: 6, sy: 3 });
  // 声音：从妈妈嘴边飘向我的纸做声波
  if (t > 55.8) for (let k = 0; k < 3; k++) {
    const p = frac((t - 55.8) * 0.6 + k / 3);
    ctx.save(); ctx.translate(mx - R * 0.45 - p * 230, my + R * 0.55 + p * 200); ctx.rotate(-0.85);
    ctx.globalAlpha = Math.sin(p * Math.PI) * ss(55.8, 56.3, t);
    ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(120,60,40,0.3)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.arc(0, 0, 36 + p * 34, Math.PI * 0.72, Math.PI * 1.28); ctx.stroke();
    ctx.restore();
  }
  const hp = popIn(t, 58.4, 0.45);
  if (hp > 0) { ctx.save(); ctx.translate(760, 560 - (t - 58.4) * 25); ctx.scale(hp, hp); heart(ctx, 0, 0, 34); ctx.restore(); }
  ctx.restore();
}

const SHOTS = [
  { a: 26.5, b: 28.45, draw: shotBank },
  { a: 28.45, b: 33.0, draw: shotSwim },
  { a: 33.0, b: 42.0, draw: shotTunnel },
  { a: 42.0, b: 55.6, draw: shotBirth },
  { a: 55.6, b: 64.2, draw: shotVoice },
];
module.exports = { SHOTS };
