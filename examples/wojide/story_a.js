// 片头 0:00–0:26.5：云上的小魂收拾前世的记忆，背上行李出发（前奏没有歌词，用“准备出发”来铺垫）
const { clamp, lerp, ss, easeInOut, easeOut, frac, rng } = require('./engine/lib');
const { W, H, TAU, sheet, P, cloud, person } = require('./engine/paper');
const { blink, backOut, popIn, jujube, coin, letter, bundle, heart } = require('./engine/props');
const { vbg, overlay, camera, star, STARS } = require('./engine/stage');
const { CAST } = require('./cast');

function nightSky(ctx, t, top = '#1f2a4d', bot = '#584b7d') {
  vbg(ctx, top, bot);
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.6, s * (0.8 + 0.2 * Math.sin(t * 2.6 + x)), r + t * 0.05);
}
const CLOUDS = (() => { const r = rng(12); return Array.from({ length: 12 }, (_, i) => ({ x: r() * W, y: 120 + r() * 700, s: 50 + r() * 70, v: 8 + r() * 18, seed: i })); })();

// 标题：纸云从两边滑入，片名纸片落下（歌名、歌手取自 LRC 的 [ti:] [ar:]）
function shotTitle(ctx, t, E) {
  const down = easeInOut(ss(7.2, 9.8, t));
  nightSky(ctx, t);
  ctx.save(); ctx.translate(0, -down * 300);
  for (const c of CLOUDS) {
    const enter = easeOut(ss(0.3 + c.seed * 0.12, 2.2 + c.seed * 0.12, t));
    const side = c.x < W / 2 ? -1 : 1;
    cloud(ctx, c.x + side * (1 - enter) * 900 + Math.sin(t * 0.3 + c.seed) * c.v, c.y, c.s, '#f7f1e6', c.seed);
  }
  const title = [...(E.meta.ti || '')];
  title.forEach((ch, i) => {
    const p = popIn(t, 2.4 + i * 0.35, 0.5);
    if (p <= 0) return;
    const x = W / 2 + (i - (title.length - 1) / 2) * 190, y = 400 + (1 - Math.min(p, 1)) * -200 + Math.sin(t * 1.2 + i) * 6;
    ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * 0.06); ctx.scale(p, p);
    sheet(ctx, P.rrect(-80, -80, 160, 160, 10), i === 1 ? '#d9534a' : '#fbf6ec', { blur: 14, sy: 7 });
    ctx.fillStyle = i === 1 ? '#fff8ee' : '#3a2c26'; ctx.font = '120px Kai'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 6);
    ctx.restore();
  });
  const ap = popIn(t, 4.2, 0.4);
  if (ap > 0) {
    ctx.save(); ctx.translate(W / 2, 560); ctx.scale(ap, ap);
    sheet(ctx, P.rrect(-90, -30, 180, 60, 6), '#fbf6ec', { blur: 8, sy: 4 });
    ctx.fillStyle = '#3a2c26'; ctx.font = '40px Kai'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(E.meta.ar || '', 0, 3);
    ctx.restore();
  }
  ctx.restore();
  overlay(ctx, '#000', 1 - ss(0, 1.5, t));
}

function island(ctx, cx, cy) {
  for (let i = 0; i < 7; i++) cloud(ctx, cx - 520 + i * 170, cy + 40 + Math.sin(i * 1.7) * 18, 95 + (i % 3) * 20, '#f7f1e6', i + 40);
  sheet(ctx, P.ellipse(cx, cy + 150, 700, 150), '#f7f1e6', { blur: 16, shadowA: 0.25 });
}

// 收拾记忆：一件件放进包袱
const MEMS = [[11.0, 'j', -420, -180], [12.6, 'c', -230, -330], [14.2, 'l', 260, -320], [15.8, 'h', 430, -170], [17.2, 'j2', 60, -400]];
function memIcon(ctx, k, x, y, s, t) {
  if (k === 'j' || k === 'j2') { jujube(ctx, x - 12 * s, y, 22 * s); jujube(ctx, x + 14 * s, y + 6 * s, 20 * s); }
  else if (k === 'c') coin(ctx, x, y, 28 * s, t * 3);
  else if (k === 'l') letter(ctx, x, y, 32 * s, Math.sin(t * 2) * 0.2);
  else heart(ctx, x, y, 28 * s);
}
function shotPacking(ctx, t) {
  nightSky(ctx, t, '#25305a', '#7a6a9a');
  const z = 1 + 0.08 * ss(9.6, 20, t);
  ctx.save(); camera(ctx, W / 2, 560, z);
  island(ctx, W / 2, 700);
  const kx = 860, ky = 760;
  const tied = t > 18.6;
  if (!tied) {
    sheet(ctx, P.ellipse(1120, 770, 210, 60), '#c98b5a', { blur: 10 });
    ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#f4dcb8';
    const r = rng(3); for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(1120 + (r() - 0.5) * 340, 770 + (r() - 0.5) * 80, 6, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  MEMS.forEach(([t0, k, dx, dy], i) => {
    const hx = 1000 + dx, hy = 600 + dy + Math.sin(t * 1.3 + i) * 12;
    const grab = clamp((t - t0) / 1.0);
    if (grab >= 1 && tied) return;
    const x = lerp(hx, 1120 + (i - 2) * 50, easeInOut(grab)), y = lerp(hy, 760, easeInOut(grab)) - Math.sin(grab * Math.PI) * 120;
    if (grab < 1) { ctx.save(); ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 3 + i); sheet(ctx, P.circle(x, y, 60), '#fff6d8', { shadow: false, edge: false }); ctx.restore(); }
    memIcon(ctx, k, x, y, 1.2 * (1 - grab * 0.3), t);
  });
  if (tied) {
    const p = backOut((t - 18.6) / 0.5);
    ctx.save(); ctx.translate(1120, 700); ctx.scale(p, p); bundle(ctx, 0, 0, 170, t); ctx.restore();
    if (t < 19.6) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, d = (t - 18.6) * 260; sheet(ctx, P.circle(1120 + Math.cos(a) * d, 700 + Math.sin(a) * d * 0.6, 14 * (1 - (t - 18.6))), '#fbf6ec', { blur: 3, sy: 2 }); }
  }
  // 小魂：抬手去够每一件记忆，放进去时开心
  const near = MEMS.find(([t0]) => t > t0 - 0.7 && t < t0 + 0.9);
  const happy = MEMS.some(([t0]) => t > t0 + 0.9 && t < t0 + 1.5);
  const look = near ? clamp(near[2] / 400, -1, 1) : 0.4;
  person(ctx, { ...CAST.soul, x: kx, y: ky, h: 300, expr: happy ? 'laugh' : near ? 'o' : 'smile', blink: blink(t, 2), turn: look,
    armL: near && near[2] < 0 ? 2.5 : 0.25, armR: near && near[2] >= 0 ? 2.5 : tied ? 0.9 : 0.25, hop: happy ? Math.abs(Math.sin(t * 10)) * 14 : 0, t });
  ctx.restore();
}

// 背上行李，沿着星星台阶走下去
function shotSetOff(ctx, t) {
  const lt = t - 20.2;
  nightSky(ctx, t, '#25305a', '#8a6f8e');
  const scroll = lt * 130;
  ctx.save(); ctx.translate(-scroll * 0.3, 0);
  for (const c of CLOUDS) cloud(ctx, c.x, c.y * 0.6 + 200, c.s * 0.8, '#efe6dc', c.seed + 60);
  ctx.restore();
  sheet(ctx, P.ellipse(W * 0.7 - scroll * 0.1, H + 420, 1300, 520), '#4f6c64', { blur: 20, shadowA: 0.2 });
  sheet(ctx, c => { c.moveTo(W * 0.3 - scroll * 0.1, H); c.bezierCurveTo(W * 0.6, H - 200, W * 0.75, H - 120, W + 40, H - 210); c.lineTo(W + 40, H - 170); c.bezierCurveTo(W * 0.78, H - 80, W * 0.62, H - 160, W * 0.4 - scroll * 0.1, H); c.closePath(); }, '#7fb6c4', { blur: 8 });
  const steps = [];
  for (let i = 0; i < 14; i++) steps.push([760 + i * 150 - scroll, 560 + Math.max(0, i - 3) * 30]);
  for (const [x, y] of steps) star(ctx, x, y + 10, 34, 0.1);
  const lift = ss(20.3, 21.4, t);
  const walking = t > 21.6;
  const i0 = clamp((lt - 1.4) * 0.87, 0, 12.9);
  const ii = Math.floor(i0), f = i0 - ii;
  const [x0, y0] = steps[Math.min(ii, 13)], [x1, y1] = steps[Math.min(ii + 1, 13)];
  const kx = walking ? lerp(x0, x1, f) : steps[0][0] + 20, ky = (walking ? lerp(y0, y1, f) - Math.sin(f * Math.PI) * 30 : steps[0][1]) - 20;
  const wob = (1 - ss(21.2, 22.4, t)) * Math.sin(t * 9) * 0.12;
  ctx.save(); ctx.translate(kx, ky); ctx.rotate(wob); ctx.translate(-kx, -ky);
  bundle(ctx, kx - 90, ky - lerp(60, 210, lift), 150, t);
  person(ctx, { ...CAST.soul, x: kx, y: ky, h: 290, expr: lift < 1 ? 'worry' : 'smile', blink: blink(t, 3), turn: 0.6, walk: walking ? lt * 7 : 0, walkAmt: walking ? 1 : 0, armL: lerp(0.2, 2.6, lift), armR: lerp(0.2, 2.4, lift), t });
  ctx.restore();
  overlay(ctx, '#27345a', ss(25.8, 26.5, t) * 0.6);
}

const SHOTS_A = [
  { a: 0, b: 9.7, draw: shotTitle },
  { a: 9.7, b: 20.2, draw: shotPacking },
  { a: 20.2, b: 26.5, draw: shotSetOff },
];
module.exports = { SHOTS_A };
