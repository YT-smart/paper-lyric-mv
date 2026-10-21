// 1:04–2:18：你不记得我 → 三段前世（回忆滤镜）→ 一次次分离又失忆着重逢
const { clamp, lerp, ss, easeInOut, easeOut, frac, rng } = require('./engine/lib');
const { W, H, TAU, sheet, P, cloud, tornRidge, person, baby, head } = require('./engine/paper');
const { blink, backOut, popIn, jujube, coin, letter, heart, chip } = require('./engine/props');
const { vbg, overlay, camera, star, STARS } = require('./engine/stage');
const K = require('./engine/kit');
const { CAST, YOUSOUL } = require('./cast');

// 妈妈的房间（中景）
function momRoom(ctx, t) {
  vbg(ctx, '#f4d7c2', '#e6b39d');
  K.windowFrame(ctx, 180, 160, 420, 460, (c, x, y, w, h) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#bfe0ee'); g.addColorStop(1, '#f6e6c8'); c.fillStyle = g; c.fillRect(x, y, w, h); cloud(c, x + 140 + Math.sin(t * 0.2) * 30, y + 120, 40, '#fdfaf3', 4); });
  sheet(ctx, P.rrect(0, 860, W, 260, 0), '#c98f73', { blur: 12 });
  sheet(ctx, P.rrect(1380, 520, 340, 360, 16), '#d9a77f', { blur: 14 });
  sheet(ctx, P.rrect(1400, 540, 300, 150, 8), '#e8c19c', { blur: 4, sy: 2 });
  sheet(ctx, P.rrect(1400, 710, 300, 150, 8), '#e8c19c', { blur: 4, sy: 2 });
  for (const y of [615, 785]) sheet(ctx, P.circle(1550, y, 12), '#9a6a4a', { shadow: false, edgeW: 1 });
  sheet(ctx, P.rrect(1470, 430, 70, 90, 8), '#7fa86a', { blur: 6 });
  for (let i = 0; i < 4; i++) sheet(ctx, P.ellipse(1505 + (i - 1.5) * 26, 400 + Math.abs(i - 1.5) * 6, 22, 46, (i - 1.5) * 0.4), '#6f9a5c', { blur: 4, sy: 2, edgeW: 1.3 });
}
// 抱着婴儿、轻轻摇晃的妈妈
function momWithBaby(ctx, x, y, h, t, o = {}) {
  const sway = Math.sin(t * 1.5) * 0.04;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sway); ctx.translate(-x, -y);
  const r = person(ctx, { ...CAST.mom, x, y, h, expr: o.expr || 'happy', blink: blink(t, 4), turn: o.turn ?? -0.3, armL: 0.9, armR: 0.9, t });
  const hx = x, hy = y - h * 0.55;
  baby(ctx, hx + h * 0.02, hy, h * 0.24, { expr: o.babyExpr || 'smile', blink: blink(t, 6), rot: -0.15, t });
  sheet(ctx, P.ellipse(hx + h * 0.12, hy + h * 0.02, h * 0.035, h * 0.028), '#f6d9c0', { blur: 4, sy: 2 });
  ctx.restore();
  return { babyX: hx - h * 0.05, babyY: hy - h * 0.03, head: r.head };
}

// 可你怎记得我：我的气泡里满是前世，你的气泡里只有一个问号
function shotForget(ctx, t) {
  momRoom(ctx, t);
  const m = momWithBaby(ctx, 940, 900, 640, t, { expr: 'smile', babyExpr: 'o' });
  K.thought(ctx, 560, 300, 210, 140, m.babyX - 40, m.babyY - 40, ss(64.6, 65.2, t), (c, x, y) => {
    jujube(c, x - 110, y - 20, 22); jujube(c, x - 80, y - 5, 20);
    coin(c, x - 10, y - 40, 26, t * 3);
    letter(c, x + 80, y - 10, 32, 0.2);
    c.save(); c.translate(x + 10, y + 60); c.scale(0.5, 0.5); person(c, { ...CAST.soldier, x: 0, y: 40, h: 120, expr: 'calm', t }); c.restore();
  });
  if (t > 66.0) { const [hx, hy, R] = m.head; chip(ctx, '？', hx + R * 1.5, hy - R * 1.2, 40 * backOut((t - 66) / 0.4), 0.15); }
}

// 我带来了另界的消息，可我怎么告知你：举着信、只会咿呀、最后打个叉
function shotMessage(ctx, t) {
  vbg(ctx, '#f6dccb', '#ecbfa8');
  const z = 1 + 0.05 * ss(69.4, 78, t);
  ctx.save(); camera(ctx, W / 2, H / 2, z);
  sheet(ctx, P.ellipse(W / 2, H + 120, 900, 420), '#e6d3b4', { blur: 20 });
  const bx = W / 2 - 80, by = 700;
  const trying = t > 72, sad = t > 76.4;
  baby(ctx, bx, by, 560, { expr: sad ? 'sad' : trying ? 'worry' : 'o', blink: blink(t, 2), rot: -0.08, t });
  const lp = popIn(t, 69.8, 0.5);
  if (lp > 0) {
    const ly = by - 330 + Math.sin(t * 2.2) * 10;
    ctx.save(); ctx.translate(bx + 40, ly); ctx.scale(lp, lp); ctx.rotate(Math.sin(t * 1.6) * 0.08);
    ctx.globalAlpha = 0.3; sheet(ctx, P.circle(0, 0, 150), '#fff6d0', { shadow: false, edge: false }); ctx.globalAlpha = 1;
    letter(ctx, 0, 0, 90, 0);
    star(ctx, 0, 10, 20, t);
    ctx.restore();
    sheet(ctx, P.ellipse(bx + 40, ly + 70, 34, 28), '#f6d9c0', { blur: 4, sy: 2 });
  }
  const say = (t0, x, y) => {
    const p = popIn(t, t0, 0.4);
    if (p <= 0 || t > t0 + 2.2) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    sheet(ctx, P.ellipse(0, 0, 150, 90), '#fdfaf3', { blur: 10 });
    sheet(ctx, P.poly([[-40, 70], [-80, 130], [10, 80]]), '#fdfaf3', { blur: 6 });
    ctx.strokeStyle = '#6f5a50'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
    const r = rng(Math.floor(t0 * 10));
    ctx.moveTo(-100, 0); for (let i = 0; i < 10; i++) ctx.quadraticCurveTo(-100 + i * 20 + 10, (r() - 0.5) * 100, -90 + i * 20, (r() - 0.5) * 30);
    ctx.stroke(); ctx.restore();
  };
  say(72.2, 1250, 330);
  say(74.7, 1320, 360);
  const xp = popIn(t, 76.6, 0.4);
  if (xp > 0) {
    ctx.save(); ctx.translate(1300, 330); ctx.scale(xp, xp);
    sheet(ctx, P.rrect(-200, -90, 400, 180, 30), '#fdfaf3', { blur: 10 });
    letter(ctx, -110, 0, 40, 0);
    ctx.fillStyle = '#c98b5a'; ctx.font = '60px Kai'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('→', 0, 0);
    heart(ctx, 110, 0, 36);
    ctx.strokeStyle = '#d24f45'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    const xs = ss(77.0, 77.4, t);
    ctx.beginPath(); ctx.moveTo(-150, -70); ctx.lineTo(-150 + 300 * xs, -70 + 140 * xs); ctx.stroke();
    ctx.restore();
  }
  // 妈妈的手指轻轻点我的脸
  const poke = Math.max(0, Math.sin((t - 70) * 2.2)) * ss(70, 71, t);
  const px = 1250 - poke * 140;
  sheet(ctx, P.rrect(px + 150, 590, 400, 150, 70), '#efe2cc', { blur: 10 });
  sheet(ctx, P.ellipse(px + 120, 665, 80, 62), '#f6d9c0', { blur: 8 });
  sheet(ctx, P.rrect(px - 40, 640, 120, 40, 20), '#f6d9c0', { blur: 6, sy: 3 });
  ctx.restore();
}

// ---------- 前世一：枣树林 ----------
// 多个圆拼成一团的纸片（树冠）：先画整团的投影和白边，再填色，避免内部出现一圈圈白线
function blobSheet(ctx, circles, fill, edge = 'rgba(255,251,242,0.92)') {
  ctx.save();
  ctx.fillStyle = 'rgba(40,24,18,0.22)'; ctx.beginPath(); for (const [x, y, r] of circles) { ctx.moveTo(x + r + 6, y + 8); ctx.arc(x + 3, y + 8, r + 3, 0, TAU); } ctx.fill();
  ctx.fillStyle = edge; ctx.beginPath(); for (const [x, y, r] of circles) { ctx.moveTo(x + r + 2.5, y); ctx.arc(x, y, r + 2.5, 0, TAU); } ctx.fill();
  ctx.fillStyle = fill; ctx.beginPath(); for (const [x, y, r] of circles) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); } ctx.fill();
  ctx.restore();
}
function jujubeTree(ctx, x, y, s, t, shake = 0) {
  sheet(ctx, c => {
    c.moveTo(x - s * 0.09, y); c.quadraticCurveTo(x - s * 0.04, y - s * 0.5, x - s * 0.06, y - s * 0.8);
    c.lineTo(x - s * 0.3, y - s * 1.05); c.lineTo(x - s * 0.26, y - s * 1.09); c.lineTo(x - s * 0.01, y - s * 0.88);
    c.lineTo(x + s * 0.05, y - s * 1.1); c.lineTo(x + s * 0.1, y - s * 1.08); c.lineTo(x + s * 0.06, y - s * 0.8);
    c.quadraticCurveTo(x + s * 0.05, y - s * 0.4, x + s * 0.1, y); c.closePath();
  }, '#6e4630', { blur: 10 });
  const r = rng(12), cs = [];
  const sh = Math.sin(t * 30) * shake * 8;
  for (let i = 0; i < 18; i++) cs.push([x + (r() - 0.5) * s * 1.2 + sh, y - s * (0.95 + r() * 0.45), s * (0.13 + r() * 0.09)]);
  blobSheet(ctx, cs, '#b99238');
  blobSheet(ctx, cs.map(([a, b, rr]) => [a - rr * 0.12, b - rr * 0.14, rr * 0.82]), '#cfa94c', 'rgba(0,0,0,0)');
  const fr = rng(4);
  for (let i = 0; i < 30; i++) { const [bx, by, br] = cs[i % cs.length]; const a = fr() * TAU, d = fr() * br * 0.85; jujube(ctx, bx + Math.cos(a) * d, by + Math.sin(a) * d + Math.sin(t * 2 + i) * 2, s * 0.024); }
}
function jujubeBg(ctx, t, pan) {
  vbg(ctx, '#f2c98e', '#f7e2bb');
  sheet(ctx, P.circle(1500 - pan * 0.1, 250, 110), '#fbe7b5', { blur: 30, shadowA: 0.15 });
  cloud(ctx, 380 - pan * 0.2, 180, 70, '#fbf3e4', 2); cloud(ctx, 1150 - pan * 0.2, 120, 55, '#fbf3e4', 5);
  ctx.save(); ctx.translate(-pan * 0.3, 0);
  tornRidge(ctx, x => 640 + Math.sin(x / 300) * 40 + Math.sin(x / 120) * 12, '#d99a5c', 1, { shadowA: 0.2 });
  ctx.restore();
  ctx.save(); ctx.translate(-pan * 0.55, 0);
  const r = rng(8);
  for (let i = -2; i < 22; i++) { const x = i * 130 + r() * 60, y = 680 + Math.sin(x / 300) * 30; sheet(ctx, P.rrect(x - 5, y - 60, 10, 60, 3), '#8d5a3c', { blur: 4, shadowA: 0.2 }); blobSheet(ctx, [[x, y - 80, 34 + r() * 10], [x - 22, y - 62, 24], [x + 22, y - 64, 26]], i % 3 ? '#c8813f' : '#b8702f'); }
  ctx.restore();
  tornRidge(ctx, x => 760 + Math.sin((x + pan * 0.8) / 400 + 1) * 25, '#c98a4a', 2);
  tornRidge(ctx, x => 980 - Math.max(0, Math.sin((x + pan - 300) / 900 * Math.PI)) * 260, '#9c6a3b', 3, { blur: 16 });
}

// 注定失忆着相遇：信化成纸屑，我睡着了，镜头推进墙上的老照片（照片里就是下一段回忆）
function shotFate(ctx, t) {
  momRoom(ctx, t);
  const fx = 1100, fy = 220;
  sheet(ctx, P.rrect(fx - 130, fy - 100, 260, 200, 8), '#b07a4f', { blur: 10 });
  ctx.save(); ctx.beginPath(); ctx.rect(fx - 112, fy - 82, 224, 164); ctx.clip();
  ctx.translate(fx - 112, fy - 82); ctx.scale(224 / W, 164 / H); jujubeBg(ctx, 83, 0); K.memoryLook(ctx, 0.8);
  ctx.restore();
  const zoom = Math.pow(easeInOut(ss(80.6, 83.0, t)), 2);
  const m = momWithBaby(ctx, 760, 900, 640, t, { expr: 'happy', babyExpr: t > 80 ? 'sleep' : 'o', turn: -0.4 });
  const dt = t - 78.2;
  if (dt > 0 && dt < 2.5) {
    const r = rng(5);
    for (let i = 0; i < 20; i++) { const a = r() * TAU, v = 60 + r() * 160; sheet(ctx, P.rrect(m.babyX + 40 + Math.cos(a) * v * dt, m.babyY - 140 + Math.sin(a) * v * dt + 60 * dt * dt, 14, 10, 2), '#f6ecd6', { blur: 3, sy: 2, edgeW: 1 }); }
  }
  if (t < 78.4) letter(ctx, m.babyX + 40, m.babyY - 140, 40 * (1 - ss(78.0, 78.4, t)), 0.1);
  const kp = popIn(t, 79.3, 0.4);
  if (kp > 0 && t < 81) { ctx.save(); ctx.translate(m.babyX + 60, m.babyY - 120 - (t - 79.3) * 40); ctx.scale(kp, kp); heart(ctx, 0, 0, 26); ctx.restore(); }
  if (zoom > 0) {
    const s = lerp(224 / W, 1, zoom), cx = lerp(fx, W / 2, zoom), cy = lerp(fy, H / 2, zoom);
    ctx.save(); ctx.translate(cx - W * s / 2, cy - H * s / 2); ctx.scale(s, s);
    ctx.globalAlpha = ss(0, 0.05, zoom);
    jujubeBg(ctx, 83, 0); K.memoryLook(ctx, 1);
    ctx.restore();
  }
}
function shotJujube(ctx, t) {
  const lt = t - 83;
  const pan = lerp(-500, 0, easeInOut(ss(83, 87.6, t)));
  jujubeBg(ctx, t, pan);
  const tx = 1080 - pan;
  const shake = t > 88.2 && t < 91.6 ? Math.abs(Math.sin((t - 88.2) * 3)) : 0;
  jujubeTree(ctx, tx, 760, 520, t, shake);
  const run = 1 - ss(86.6, 87.6, t);
  const bx = lerp(300 - pan, tx - 180, easeInOut(ss(83.4, 87.4, t)));
  const gx = lerp(150 - pan, tx + 260, easeInOut(ss(83.6, 87.8, t)));
  const hillY = x => 980 - Math.max(0, Math.sin((x + pan - 300) / 900 * Math.PI)) * 260 + 30;
  const boyShake = t > 88.2 && t < 91.6;
  person(ctx, { ...CAST.soul, x: bx, y: Math.min(hillY(bx), 1000), h: 290, expr: boyShake ? 'laugh' : 'happy', blink: blink(t, 1), turn: run > 0 ? 0.6 : 0.3, walk: lt * 9, walkAmt: run, armL: boyShake ? 2.7 : 0.6 * run + 0.2, armR: boyShake ? 2.5 : 0.6 * run + 0.2, hop: boyShake ? Math.abs(Math.sin(t * 12)) * 16 : 0, t });
  const catching = t > 91.0;
  person(ctx, { ...CAST.girl, x: gx, y: Math.min(hillY(gx), 1000), h: 280, expr: catching ? 'laugh' : 'happy', blink: blink(t, 2), turn: run > 0 ? 0.6 : -0.3, walk: lt * 9, walkAmt: run, armL: catching ? 0.9 : 0.3, armR: catching ? 0.9 : 0.3, t });
  if (catching) {
    sheet(ctx, P.ellipse(gx, hillY(gx) - 110, 70, 34), '#b84338', { blur: 6 });
    const n = Math.min(6, Math.floor((t - 91.0) * 2.5));
    for (let i = 0; i < n; i++) jujube(ctx, gx - 40 + (i % 3) * 30, hillY(gx) - 118 - Math.floor(i / 3) * 14, 13);
  }
  if (t > 88.4) for (let k = 0; k < 5; k++) {
    const p = frac((t - 88.4) * 0.9 + k / 5);
    const ex = catching ? gx : tx - 200 + k * 90;
    jujube(ctx, lerp(tx - 150 + k * 70, ex, p), lerp(480, hillY(ex) - (catching ? 120 : 20), p * p), 14);
  }
  K.memoryLook(ctx, 1);
}

// ---------- 前世二：叔父与跟屁虫侄儿 ----------
function oldStreet(ctx, t, scroll) {
  vbg(ctx, '#f0d3a2', '#e7b787');
  sheet(ctx, P.circle(400, 260, 90), '#fbe5b0', { blur: 26, shadowA: 0.12 });
  ctx.save(); ctx.translate(-scroll * 0.3, 0);
  const r = rng(61);
  for (let i = -1; i < 16; i++) K.house(ctx, i * 210 + r() * 40, 700, 170 + r() * 50, 120 + r() * 70, '#d9b48f', '#8d6a58', { win: true });
  ctx.restore();
  ctx.save(); ctx.translate(-scroll, 0);
  const r2 = rng(62);
  for (let i = -1; i < 20; i++) {
    const x = i * 330 + r2() * 40;
    K.house(ctx, x, 880, 280, 230 + r2() * 60, '#efdcc0', '#5f4a42', { door: true });
    K.lantern(ctx, x + 300, 640, 30, t);
  }
  ctx.restore();
  sheet(ctx, P.rrect(-20, 860, W + 40, 260, 0), '#c7a67e', { blur: 10 });
  ctx.save(); ctx.strokeStyle = 'rgba(255,250,240,0.4)'; ctx.lineWidth = 3;
  for (let i = 0; i < 30; i++) { const x = ((i * 140 - scroll) % (W + 140) + W + 140) % (W + 140) - 70; ctx.beginPath(); ctx.moveTo(x, 900); ctx.lineTo(x - 60, 1080); ctx.stroke(); }
  ctx.restore();
}
function shotUncle(ctx, t) {
  const lt = t - 96.8;
  const stop = 103.6;
  const moving = t < stop;
  const scroll = (Math.min(t, stop) - 96.8) * 110;
  oldStreet(ctx, t, scroll);
  const ux = 980;
  const turned = t > 104.2, giving = t > 105.6;
  const u = person(ctx, { ...CAST.uncle, x: ux, y: 950, h: 560, expr: turned ? (giving ? 'happy' : 'o') : 'smile', blink: blink(t, 1), turn: turned ? -0.7 : 0.5, walk: lt * 5, walkAmt: moving ? 1 : 0, armL: giving ? 1.3 : 0.25, armR: 0.25, t });
  // 侄儿：跟在身后学他走路；叔父一停就撞上
  const kidIn = ss(101.0, 102.2, t);
  const bump = t > stop + 0.3 && t < stop + 0.8 ? Math.sin((t - stop - 0.3) / 0.5 * Math.PI) : 0;
  const kx = lerp(-200, ux - 230, kidIn) + (t > stop ? Math.min(t - stop, 0.3) * 200 : 0) - bump * 30;
  const coinsIn = t > 106.2, jumping = t > 108.4;
  person(ctx, { ...CAST.nephew, x: kx, y: 950 - (jumping ? Math.abs(Math.sin(t * 8)) * 40 : 0), h: 270, expr: bump > 0 ? 'o' : coinsIn ? 'laugh' : 'happy', blink: blink(t, 2), turn: 0.6, walk: lt * 7, walkAmt: t < stop + 0.3 ? 1 : 0, armL: coinsIn ? 2.2 : 0.4, armR: coinsIn ? 2.2 : 0.4, lean: bump * -1, t });
  if (bump > 0) chip(ctx, '咚', kx + 120, 620, 34 * bump, 0.2, '#fff4d6', '#d24f45');
  for (let i = 0; i < 3; i++) {
    const t0 = 105.9 + i * 0.7, p = clamp((t - t0) / 0.8);
    if (t < t0) continue;
    const [sx, sy] = u.handL;
    if (p < 1) coin(ctx, lerp(sx, kx, p), lerp(sy, 680, p) - Math.sin(p * Math.PI) * 160, 22, (t - t0) * 14);
  }
  if (coinsIn) for (let i = 0; i < Math.min(3, Math.floor((t - 106.6) / 0.7) + 1); i++) coin(ctx, kx - 30 + i * 30, 600 - (jumping ? Math.abs(Math.sin(t * 8)) * 40 : 0) - i * 6, 20, t * 4 + i);
  K.memoryLook(ctx, 1);
}

// ---------- 前世三：恋人与战争 ----------
const PETALS = (() => { const r = rng(91); return Array.from({ length: 24 }, () => ({ x: r(), o: r(), s: 6 + r() * 6, v: 0.1 + r() * 0.1 })); })();
function shotLovers(ctx, t) {
  const war = ss(112.6, 114.0, t);
  vbg(ctx, war > 0.5 ? '#8a5a52' : '#f6cbbf', war > 0.5 ? '#c27a5a' : '#fbe4d3');
  overlay(ctx, '#7a3a2e', war * 0.35);
  tornRidge(ctx, x => 720 + Math.sin(x / 260) * 30, war > 0.5 ? '#6a4a3e' : '#9fc18a', 7);
  tornRidge(ctx, x => 820 + Math.sin(x / 300 + 2) * 20, war > 0.5 ? '#5a3a30' : '#7faa6c', 8);
  if (war > 0) for (let i = 0; i < 5; i++) {
    const p = frac((t - 112.6) * 0.5 + i / 5);
    ctx.save(); ctx.globalAlpha = war * Math.sin(p * Math.PI);
    cloud(ctx, 200 + i * 380, 700 - p * 200, 50 + p * 60, '#5d5452', i + 30);
    sheet(ctx, P.circle(200 + i * 380, 720, 30 * (1 - p)), '#f2a65a', { shadow: false, edge: false });
    ctx.restore();
  }
  sheet(ctx, P.rrect(1400, 420, 34, 440, 12), '#6e4630', { blur: 8 });
  blobSheet(ctx, [[1417, 380, 140], [1300, 440, 100], [1530, 450, 110], [1420, 300, 100]], war > 0.5 ? '#8a6a5e' : '#f2a7b4');
  if (war < 1) for (const p of PETALS) { const y = frac(p.o + (t - 110) * p.v) * H, x = p.x * W + Math.sin(t + p.o * 9) * 40; ctx.save(); ctx.globalAlpha = 1 - war; sheet(ctx, P.ellipse(x, y, p.s, p.s * 0.6, t + p.o * 9), '#f5b8c4', { blur: 2, sy: 1, edgeW: 1 }); ctx.restore(); }
  const worried = war > 0.5;
  person(ctx, { ...CAST.lover, x: 820, y: 900, h: 520, expr: worried ? 'worry' : 'happy', blink: blink(t, 1), turn: 0.5, armR: 0.7, t });
  person(ctx, { ...CAST.soldier, hat: worried ? 'army' : 'none', x: 1060, y: 900, h: 540, expr: worried ? 'calm' : 'happy', blink: blink(t, 2), turn: -0.5, armL: 0.7, t, coat: worried ? CAST.soldier.coat : '#8a6f5a', belt: worried ? CAST.soldier.belt : null });
  if (!worried) { const hp = popIn(t, 111.2, 0.4); if (hp > 0) heart(ctx, 940, 300 - (t - 111.2) * 20, 30 * hp); }
  K.memoryLook(ctx, 1);
}
function shotStation(ctx, t) {
  vbg(ctx, '#9c8a84', '#cdb5a0');
  overlay(ctx, '#5a3a32', 0.15);
  sheet(ctx, P.rrect(-20, 700, W + 40, 60, 0), '#7a6a64', { blur: 10 });
  for (let i = 0; i < 6; i++) sheet(ctx, P.rrect(120 + i * 340, 260, 30, 440, 6), '#5d504c', { blur: 6 });
  sheet(ctx, P.rrect(-20, 240, W + 40, 40, 0), '#5d504c', { blur: 8 });
  const go = easeInOut(ss(116.8, 119.2, t));
  K.train(ctx, 1500 + go * 1600, 700, 300, t * (0.3 + go * 2));
  sheet(ctx, P.rrect(-20, 760, W + 40, 340, 0), '#a8968a', { blur: 12 });
  if (go < 0.6) {
    const wx = 1500 + go * 1600 - 140;
    ctx.save(); ctx.beginPath(); ctx.rect(wx - 60, 490, 120, 120); ctx.clip();
    person(ctx, { ...CAST.soldier, x: wx, y: 760, h: 320, expr: 'sad', armR: 2.6 + Math.sin(t * 8) * 0.25, t }); ctx.restore();
  }
  const run = ss(117.2, 117.6, t) * (1 - ss(118.6, 119.0, t));
  const lx = 700 + ss(117.2, 119.0, t) * 260;
  const L = person(ctx, { ...CAST.lover, x: lx, y: 980, h: 520, expr: t > 118.8 ? 'cry' : 'sad', blink: blink(t, 3), turn: 0.6, walk: t * 8, walkAmt: run, armR: 2.6 + Math.sin(t * 7) * 0.3, t });
  sheet(ctx, P.poly([[L.handR[0], L.handR[1]], [L.handR[0] + 50, L.handR[1] - 30 + Math.sin(t * 9) * 12], [L.handR[0] + 40, L.handR[1] + 30]]), '#fbf6ec', { blur: 4, sy: 2 });
  K.memoryLook(ctx, 1);
}
function shotLetters(ctx, t) {
  vbg(ctx, '#d9c3ad', '#c3a78e');
  const winter = ss(121.0, 122.6, t);
  K.windowFrame(ctx, 1080, 180, 600, 460, (c, x, y, w, h) => {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, winter > 0.5 ? '#c9d3dc' : '#f2c98e'); g.addColorStop(1, winter > 0.5 ? '#e9eef2' : '#f7e2bb'); c.fillStyle = g; c.fillRect(x, y, w, h);
    sheet(c, P.rrect(x + 380, y + 160, 26, 300, 8), '#6e4630', { blur: 4 });
    if (winter < 1) { c.save(); c.globalAlpha = 1 - winter; blobSheet(c, [[x + 393, y + 150, 90], [x + 320, y + 200, 70], [x + 470, y + 200, 70]], '#d98b3a'); c.restore(); }
    const r = rng(3);
    for (let i = 0; i < 24; i++) { const fy = frac(r() + t * 0.15) * h; const fx = r() * w + Math.sin(t + i) * 20; if (winter > 0.5) sheet(c, P.circle(x + fx, y + fy, 6), '#ffffff', { shadow: false, edgeW: 0.8 }); else sheet(c, P.ellipse(x + fx, y + fy, 10, 5, t + i), '#d98b3a', { shadow: false, edgeW: 0.8 }); }
  });
  sheet(ctx, P.rrect(200, 760, 1500, 60, 10), '#8a5a3a', { blur: 12 });
  sheet(ctx, P.rrect(260, 820, 1380, 300, 6), '#6e4630', { blur: 10 });
  const got = [119.4, 120.2];
  const pile = got.filter(g => t > g + 0.8).length;
  for (let i = 0; i < pile; i++) letter(ctx, 1000 + i * 30, 740 - i * 8, 46, 0.1 * i);
  got.forEach((g, i) => { const p = clamp((t - g) / 0.8); if (p > 0 && p < 1) letter(ctx, lerp(1400, 1000 + i * 30, p), lerp(380, 740 - i * 8, p) - Math.sin(p * Math.PI) * 100, 46, p * 6); });
  const waiting = t > 121.0;
  person(ctx, { ...CAST.lover, x: 620, y: 1100, h: 640, expr: t > 122.8 ? 'cry' : waiting ? 'sad' : 'smile', blink: blink(t, 2), turn: waiting ? 0.7 : 0.3, armR: waiting ? 0.5 : 1.0, armL: 0.6, t });
  if (t > 121.6) chip(ctx, '…', 780, 360, 34 * popIn(t, 121.6, 0.4), 0, '#fdfaf3', '#6f5a50');
  K.memoryLook(ctx, 1);
}

// ---------- 轮回 ----------
function wheelFrame(ctx, x, y, s, draw) {
  sheet(ctx, P.rrect(x - s, y - s * 0.75, s * 2, s * 1.5, 10), '#fbf6ec', { blur: 10 });
  ctx.save(); ctx.beginPath(); ctx.rect(x - s * 0.9, y - s * 0.65, s * 1.8, s * 1.3); ctx.clip(); draw(ctx, x, y + s * 0.6); ctx.restore();
}
function shotWheel(ctx, t) {
  vbg(ctx, '#2a2d55', '#5d4a7a');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.8, s * 0.8, r);
  const cx = W / 2, cy = 520, R = 330, rot = (t - 124.2) * 0.35;
  ctx.save(); ctx.strokeStyle = '#f6e7c8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  for (let i = 0; i < 6; i++) { const a = rot + i / 6 * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
  ctx.restore();
  sheet(ctx, P.circle(cx, cy, 40), '#f3d27a', { blur: 8 });
  const pairs = [
    (c, x, y) => { c.fillStyle = '#f2c98e'; c.fillRect(x - 200, y - 300, 400, 400); person(c, { ...CAST.soul, x: x - 40, y, h: 110, expr: 'happy', t }); person(c, { ...CAST.girl, x: x + 40, y, h: 105, expr: 'happy', t }); },
    (c, x, y) => { c.fillStyle = '#f0d3a2'; c.fillRect(x - 200, y - 300, 400, 400); person(c, { ...CAST.uncle, x: x - 30, y: y + 20, h: 180, expr: 'smile', t }); person(c, { ...CAST.nephew, x: x + 50, y, h: 90, expr: 'laugh', t }); },
    (c, x, y) => { c.fillStyle = '#f6cbbf'; c.fillRect(x - 200, y - 300, 400, 400); person(c, { ...CAST.lover, x: x - 35, y: y + 20, h: 175, expr: 'happy', t }); person(c, { ...CAST.soldier, x: x + 40, y: y + 20, h: 180, expr: 'happy', t }); },
    (c, x, y) => { c.fillStyle = '#f4d7c2'; c.fillRect(x - 200, y - 300, 400, 400); person(c, { ...CAST.mom, x, y: y + 30, h: 190, expr: 'happy', armL: 0.9, armR: 0.9, t }); },
  ];
  pairs.forEach((d, i) => {
    const a = rot + i / pairs.length * TAU;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    ctx.save(); ctx.strokeStyle = '#f6e7c8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 30); ctx.stroke(); ctx.restore();
    wheelFrame(ctx, x, y + 100, 105, d);
  });
}
function shotPart(ctx, t) {
  vbg(ctx, '#2a2d55', '#6a5584');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.8, s * 0.8, r);
  const cx = W / 2, cy = 560, R = 360;
  ctx.save(); ctx.strokeStyle = 'rgba(246,231,200,0.9)'; ctx.lineWidth = 34; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.setLineDash([20, 26]); ctx.strokeStyle = '#d9c3a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.restore();
  // 在顶上挥手道别，背向而行，沿着圆走到底下又撞见——谁也不记得谁
  const p = easeInOut(ss(130.6, 134.6, t));
  const a1 = -Math.PI / 2 - p * Math.PI, a2 = -Math.PI / 2 + p * Math.PI;
  const meet = t > 134.6;
  const sep = meet ? 0 : 1 - ss(0, 0.04, p);
  const x1 = cx + Math.cos(a1) * R - sep * 50, y1 = cy + Math.sin(a1) * R + 10;
  const x2 = cx + Math.cos(a2) * R + sep * 50, y2 = cy + Math.sin(a2) * R + 10;
  const walking = p > 0 && p < 1;
  const puzzled = meet && t < 136.2;
  person(ctx, { ...CAST.soul, x: meet ? cx - 70 : x1, y: y1, h: 220, expr: t < 130.6 ? 'sad' : puzzled ? 'o' : meet ? 'laugh' : 'calm', blink: blink(t, 1), turn: meet ? 0.6 : -0.5, walk: t * 7, walkAmt: walking ? 1 : 0, armR: t < 130.4 ? 2.6 + Math.sin(t * 8) * 0.3 : 0.3, t });
  person(ctx, { ...YOUSOUL, x: meet ? cx + 70 : x2, y: y2, h: 215, expr: t < 130.6 ? 'sad' : puzzled ? 'o' : meet ? 'laugh' : 'calm', blink: blink(t, 2), turn: meet ? -0.6 : 0.5, walk: t * 7, walkAmt: walking ? 1 : 0, armL: t < 130.4 ? 2.6 + Math.sin(t * 8 + 1) * 0.3 : 0.3, t });
  if (puzzled) { chip(ctx, '？', cx - 120, y1 - 260, 30 * popIn(t, 134.8)); chip(ctx, '？', cx + 120, y2 - 260, 30 * popIn(t, 135.0)); }
  if (t > 136.2) heart(ctx, cx, y1 - 300 - (t - 136.2) * 30, 34 * popIn(t, 136.2, 0.4));
}

const SHOTS_B = [
  { a: 64.2, b: 69.4, draw: shotForget },
  { a: 69.4, b: 78.0, draw: shotMessage },
  { a: 78.0, b: 83.0, draw: shotFate },
  { a: 83.0, b: 96.8, draw: shotJujube },
  { a: 96.8, b: 110.4, draw: shotUncle },
  { a: 110.4, b: 115.0, draw: shotLovers },
  { a: 115.0, b: 119.2, draw: shotStation },
  { a: 119.2, b: 124.2, draw: shotLetters },
  { a: 124.2, b: 128.8, draw: shotWheel },
  { a: 128.8, b: 138.0, draw: shotPart },
];
module.exports = { SHOTS_B, blobSheet, jujubeBg, jujubeTree, momRoom, momWithBaby, oldStreet };
