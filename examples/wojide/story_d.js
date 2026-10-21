// 3:54–结尾：万家灯火里怀着我的你 → 奔向你 → 我终于找到你 → 回忆墙 + 制作人员 + 片尾标题
const { clamp, lerp, ss, easeInOut, easeOut, frac, rng } = require('./engine/lib');
const { createCanvas } = require('@napi-rs/canvas');
const { W, H, TAU, sheet, P, tornRidge, person, baby, head, lyricChips } = require('./engine/paper');
const { blink, backOut, popIn, heart } = require('./engine/props');
const { vbg, overlay, camera, star, STARS, rings } = require('./engine/stage');
const K = require('./engine/kit');
const { CAST } = require('./cast');
const { jujubeBg, oldStreet, momRoom } = require('./story_b');
const { GM, meadow } = require('./story_c');

const PASSERS = (() => { const r = rng(240); return Array.from({ length: 7 }, (_, i) => ({ o: r(), v: 0.04 + r() * 0.05, dir: r() < 0.5 ? 1 : -1, c: ['#6f8fb8', '#d6554a', '#7d7468', '#e7ad55', '#5c7fa6'][i % 5], kid: r() < 0.3, h: r() < 0.5 ? 'long' : 'boy' })); })();
// 城池的拐角，夕阳西下
function shotCorner(ctx, t) {
  const sun = ss(233.6, 238.7, t);
  vbg(ctx, '#f2a37f', '#fbd6a0');
  overlay(ctx, '#7a4a7a', sun * 0.3);
  sheet(ctx, P.circle(1300, 520 + sun * 160, 110), '#fde3a0', { blur: 26, shadowA: 0.15 });
  K.city(ctx, 760, r => (r < sun * 0.3 ? 1 : 0), t);
  sheet(ctx, P.rrect(-20, 760, W + 40, 340, 0), '#a77b6a', { blur: 12 });
  sheet(ctx, P.rrect(-20, 860, W + 40, 20, 0), '#d9b48f', { shadow: false, edgeW: 1 });
  sheet(ctx, P.rrect(1560, 120, 420, 700, 6), '#c98f73', { blur: 16 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) sheet(ctx, P.rrect(1620 + j * 160, 200 + i * 150, 90, 100, 4), sun > 0.6 ? '#f9d98a' : '#8a6a6a', { blur: 3, sy: 2 });
  sheet(ctx, P.rrect(400, 420, 18, 440, 8), '#4a3a3e', { blur: 6 });
  sheet(ctx, P.ellipse(409, 420, 50, 24), '#4a3a3e', { blur: 6 });
  const lamp = ss(236.4, 236.8, t);
  if (lamp > 0) { ctx.save(); ctx.globalAlpha = 0.35 * lamp; sheet(ctx, P.poly([[380, 440], [440, 440], [560, 860], [260, 860]]), '#fde3a0', { shadow: false, edge: false }); ctx.restore(); sheet(ctx, P.circle(409, 440, 18), '#fde3a0', { shadow: false }); }
  for (const p of PASSERS) {
    const x = p.dir > 0 ? frac(p.o + (t - 233) * p.v) * (W + 400) - 200 : W + 200 - frac(p.o + (t - 233) * p.v) * (W + 400);
    person(ctx, { kind: p.kid ? 'kid' : 'adult', hairStyle: p.h, hair: '#2f2422', coat: p.c, pants: '#3e3a46', x, y: 960, h: p.kid ? 200 : 380, expr: 'smile', turn: p.dir * 0.6, walk: t * 6 + p.o * 9, walkAmt: 1, t, sprout: false });
  }
}
// 推近的目标：画面中间那栋前排楼的一扇窗（推向空白处会只看到大块楼体，很空）
const TW = (() => {
  const { front } = K.CITY;
  const b = front.reduce((best, f) => Math.abs(f[0] + f[1] / 2 - W / 2) < Math.abs(best[0] + best[1] / 2 - W / 2) ? f : best);
  const [wx, wy] = b[3][Math.min(4, b[3].length - 1)];
  return [b[0] + wx + 11, 1000 - b[2] + wy + 14];
})();
// 万家灯火：窗一扇扇亮起，推近其中一扇
function shotLights(ctx, t) {
  const k = easeInOut(ss(240.4, 242.6, t));
  const z = 1 + 2.4 * k * k;
  vbg(ctx, '#3a3466', '#9a6a8a');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 0.8, s * 0.6, r);
  ctx.save(); camera(ctx, lerp(W / 2, TW[0], k), lerp(H / 2, TW[1], k), z);
  K.city(ctx, 1000, r => ss(238.7 + r * 2.4, 238.9 + r * 2.4, t), t, { back: '#6a5584' });
  ctx.restore();
  overlay(ctx, '#f9d98a', ss(242.0, 242.5, t) * 0.9);
}
// 那一扇窗纱里：怀着我的你，望着天上落下的一颗星（那颗星就是我）
function shotWindow(ctx, t) {
  vbg(ctx, '#f6d5b8', '#e9b398');
  K.windowFrame(ctx, 980, 140, 700, 600, (c, x, y, w, h) => {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2a2d5e'); g.addColorStop(1, '#8a6a8a'); c.fillStyle = g; c.fillRect(x, y, w, h);
    for (const [sx, sy, s, r] of STARS) star(c, x + sx * 0.36, y + sy * 0.6, s * 0.6, r);
    const p = ss(243.4, 247.6, t);
    star(c, lerp(x + w * 0.85, x + w * 0.45, p), lerp(y + 40, y + h * 0.75, p), 22, t * 2);
    for (let i = 1; i < 6; i++) { c.save(); c.globalAlpha = 0.5 - i * 0.08; star(c, lerp(x + w * 0.85, x + w * 0.45, p - i * 0.04), lerp(y + 40, y + h * 0.75, p - i * 0.04), 22 - i * 3, 0); c.restore(); }
  });
  const sw = Math.sin(t * 1.2) * 20;
  ctx.save(); ctx.globalAlpha = 0.55;
  sheet(ctx, c => { c.moveTo(950, 110); c.quadraticCurveTo(1060 + sw, 400, 990, 780); c.lineTo(950, 780); c.closePath(); }, '#fdfaf3', { blur: 6 });
  sheet(ctx, c => { c.moveTo(1710, 110); c.quadraticCurveTo(1600 + sw, 400, 1670, 780); c.lineTo(1710, 780); c.closePath(); }, '#fdfaf3', { blur: 6 });
  ctx.restore();
  sheet(ctx, P.rrect(0, 880, W, 220, 0), '#c98f73', { blur: 12 });
  const smile = t > 245.5;
  person(ctx, { ...CAST.mom, belly: true, x: 640, y: 1000, h: 760, expr: smile ? 'happy' : 'smile', blink: blink(t, 1), turn: 0.4, armL: 0.55, armR: 0.65, t });
  sheet(ctx, P.ellipse(700, 640, 30, 24), '#f6d9c0', { blur: 4, sy: 2 });
  if (smile) heart(ctx, 760, 300 - (t - 245.8) * 20, 30 * popIn(t, 245.8, 0.4));
}
// 终章副歌：卸下行李的小魂穿过光圈奔跑
function shotRun(ctx, t) {
  vbg(ctx, '#f8d3b8', '#f2b39a');
  rings(ctx, W / 2, H / 2, t, 248, 0.22, 1);
  const lt = t - 248;
  const kx = W / 2 + Math.sin(t * 1.2) * 40, ky = 820 + Math.abs(Math.sin(t * 7)) * -18;
  person(ctx, { ...CAST.soul, x: kx, y: ky, h: 300, expr: 'laugh', blink: blink(t, 1), walk: lt * 12, walkAmt: 1, armL: 1.6 + Math.sin(t * 12) * 0.4, armR: 1.6 - Math.sin(t * 12) * 0.4, t });
  for (let i = 0; i < 4; i++) { const p = frac(lt * 0.6 + i / 4); ctx.save(); ctx.globalAlpha = 1 - p; heart(ctx, kx - 80 + i * 50, ky - 330 - p * 120, 18); ctx.restore(); }
}
// 你张开双臂，我扑进你怀里
function shotArms(ctx, t) {
  momRoom(ctx, t);
  const jump = clamp((t - 261.6) / 0.7);
  const open = ss(256.6, 257.6, t);
  if (jump <= 0) {
    person(ctx, { ...CAST.mom, x: 1180, y: 1000, h: 700, expr: 'happy', blink: blink(t, 1), turn: -0.4, armL: lerp(0.2, 1.9, open), armR: lerp(0.2, 1.9, open), t });
    const kx = lerp(-200, 560, easeOut(ss(256.6, 260.4, t)));
    person(ctx, { ...CAST.soul, x: kx, y: 1000, h: 300, expr: 'laugh', blink: blink(t, 2), turn: 0.6, walk: t * 12, walkAmt: 1 - ss(260.2, 260.6, t), armL: 1.4, armR: 1.4, t });
  } else {
    ctx.save(); camera(ctx, 1100, 560, 1 + 0.15 * easeOut(clamp((t - 262) / 3)));
    const kx = lerp(560, 1150, easeOut(jump)), ky = lerp(1000, 640, easeOut(jump)) - Math.sin(jump * Math.PI) * 200;
    person(ctx, { ...CAST.mom, x: 1180, y: 1000, h: 700, expr: 'laugh', blink: blink(t, 1), turn: -0.2, armL: lerp(1.9, 1.0, jump), armR: lerp(1.9, 1.0, jump), t });
    person(ctx, { ...CAST.soul, x: kx, y: ky, h: 300, expr: 'laugh', blink: blink(t, 2), turn: 0.3, armL: 2.4, armR: 2.4, t });
    ctx.restore();
    const bt = t - 262.3;
    if (bt > 0) { const r = rng(9); for (let i = 0; i < 24; i++) { const a = r() * TAU, d = Math.min(bt, 3) * (120 + r() * 260); ctx.save(); ctx.globalAlpha = clamp(1 - bt / 6); heart(ctx, 1150 + Math.cos(a) * d, 520 + Math.sin(a) * d * 0.7 - bt * 20, 12 + r() * 14); ctx.restore(); } }
  }
}
// 我终于找到你：小指上系上红线
function shotFound(ctx, t) {
  vbg(ctx, '#f8d9c4', '#f0b9a0');
  ctx.save(); camera(ctx, W / 2, H / 2, 1 + 0.06 * ss(270, 276, t));
  for (let i = 0; i < 8; i++) { const p = frac(t * 0.15 + i / 8); ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.8; star(ctx, 160 + i * 230, 900 - p * 800, 14, p * 3); ctx.restore(); }
  sheet(ctx, c => { c.moveTo(600, H + 40); c.bezierCurveTo(640, 820, 820, 760, 1020, 760); c.bezierCurveTo(1220, 760, 1400, 820, 1440, H + 40); c.closePath(); }, '#efe2cc', { blur: 16 });
  head(ctx, 1020, 470, 250, { ...CAST.mom, expr: 'happy', blink: blink(t, 1), t, tilt: -0.12 });
  baby(ctx, 860, 860, 320, { expr: t > 272 ? 'laugh' : 'happy', blink: blink(t, 4), rot: -0.25, t, hand: true });
  const lp = ss(272.2, 273.6, t);
  ctx.save(); ctx.strokeStyle = '#d24f45'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(790, 820); ctx.bezierCurveTo(820, 960, 1140, 980, lerp(790, 1180, lp), lerp(820, 860, lp)); ctx.stroke(); ctx.restore();
  sheet(ctx, P.ellipse(1190, 860, 46, 34), '#f6d9c0', { blur: 6 });
  if (lp >= 1) heart(ctx, 990, 940, 30 * popIn(t, 273.6, 0.5));
  ctx.restore();
}

// 尾声：回忆墙——每一世的照片用红线串在一起（照片内容只渲染一次，缓存成小图）
let POLAROIDS = null;
function polaroids() {
  if (POLAROIDS) return POLAROIDS;
  const scenes = [
    c => { jujubeBg(c, 90, 0); K.hug(c, 960, 960, { ...CAST.soul, h: 300 }, { ...CAST.girl, h: 290 }, 0, { hearts: false }); },
    c => { oldStreet(c, 0, 300); person(c, { ...CAST.uncle, x: 900, y: 960, h: 560, expr: 'happy', armL: 1.3 }); person(c, { ...CAST.nephew, x: 700, y: 960, h: 270, expr: 'laugh', armL: 2.2, armR: 2.2 }); },
    c => { vbg(c, '#f6cbbf', '#fbe4d3'); tornRidge(c, () => 760, '#9fc18a', 7); K.hug(c, 960, 960, { ...CAST.lover, h: 520 }, { ...CAST.soldier, hat: 'none', h: 540 }, 0, { hearts: false }); },
    c => { meadow(c, 0); person(c, { ...GM, x: 1060, y: 940, h: 560, expr: 'happy', turn: -0.4 }); person(c, { ...CAST.soul, x: 760, y: 960, h: 260, expr: 'happy', turn: 0.5 }); },
    c => { vbg(c, '#f8d9c4', '#f0b9a0'); head(c, 1020, 470, 250, { ...CAST.mom, expr: 'happy', tilt: -0.12 }); baby(c, 860, 860, 320, { expr: 'laugh', rot: -0.25 }); },
  ];
  POLAROIDS = scenes.map(draw => { const c = createCanvas(480, 270), g = c.getContext('2d'); g.scale(0.25, 0.25); draw(g); return c; });
  return POLAROIDS;
}
const SPOTS = [[330, 330, -0.08], [800, 250, 0.05], [1270, 330, -0.04], [560, 690, 0.06], [1060, 700, -0.06]];
function shotWall(ctx, t, E) {
  vbg(ctx, '#d9b48f', '#c99f78');
  const pics = polaroids();
  ctx.save(); ctx.translate(Math.sin((t - 276) * 0.05) * 60, 0);
  ctx.save(); ctx.strokeStyle = '#d24f45'; ctx.lineWidth = 5;
  const lp = ss(277, 283, t);
  ctx.beginPath(); SPOTS.forEach(([x, y], i) => { if (i / (SPOTS.length - 1) <= lp + 0.001) (i ? ctx.lineTo(x + 220, y - 140) : ctx.moveTo(x + 220, y - 140)); }); ctx.stroke(); ctx.restore();
  SPOTS.forEach(([x, y, r], i) => {
    const p = backOut((t - (276.2 + i * 1.2)) / 0.6);
    if (p <= 0) return;
    ctx.save(); ctx.translate(x + 220, y); ctx.rotate(r + Math.sin(t * 0.8 + i) * 0.01); ctx.scale(p, p);
    sheet(ctx, P.rrect(-250, -170, 500, 360, 6), '#fbf8f0', { blur: 16, sy: 8 });
    ctx.drawImage(pics[i], -230, -150, 460, 259);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = i < 3 ? 0.3 : 0.1; ctx.fillStyle = '#e9c9a0'; ctx.fillRect(-230, -150, 460, 259); ctx.restore();
    sheet(ctx, P.circle(0, -150, 16), '#d24f45', { blur: 4, sy: 2 });
    ctx.restore();
  });
  ctx.restore();
  // 制作人员纸片（读自 LRC 里“编曲：xx”这类行）
  for (const c of E.credits) if (t >= c.t && t < c.end + 0.15) lyricChips(ctx, c.text, t, c.t, c.end, { size: 34, y: H * 0.93 });
  const tp = ss(306, 309, t);
  if (tp > 0) {
    overlay(ctx, '#2a2238', tp * 0.55);
    const title = [...(E.meta.ti || '')];
    title.forEach((ch, i) => {
      const p = popIn(t, 308 + i * 0.4, 0.5);
      if (p <= 0) return;
      ctx.save(); ctx.translate(W / 2 + (i - (title.length - 1) / 2) * 190, 470); ctx.rotate((i - 1) * 0.05); ctx.scale(p, p);
      sheet(ctx, P.rrect(-80, -80, 160, 160, 10), i === 1 ? '#d9534a' : '#fbf6ec', { blur: 14, sy: 7 });
      ctx.fillStyle = i === 1 ? '#fff8ee' : '#3a2c26'; ctx.font = '120px Kai'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 6);
      ctx.restore();
    });
    const ap = popIn(t, 310, 0.4);
    if (ap > 0) { ctx.save(); ctx.translate(W / 2, 640); ctx.scale(ap, ap); sheet(ctx, P.rrect(-90, -30, 180, 60, 6), '#fbf6ec', { blur: 8, sy: 4 }); ctx.fillStyle = '#3a2c26'; ctx.font = '40px Kai'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(E.meta.ar || '', 0, 3); ctx.restore(); }
  }
  overlay(ctx, '#000', ss(E.duration - 4.3, E.duration - 0.2, t));
}

const SHOTS_D = [
  { a: 233.6, b: 238.7, draw: shotCorner },
  { a: 238.7, b: 242.4, draw: shotLights },
  { a: 242.4, b: 248.0, draw: shotWindow },
  { a: 248.0, b: 256.6, draw: shotRun },
  { a: 256.6, b: 270.2, draw: shotArms },
  { a: 270.2, b: 276.0, draw: shotFound },
  { a: 276.0, b: 9999, draw: shotWall },
];
module.exports = { SHOTS_D };
