// 表演小工具与通用道具
const { rng, clamp } = require('./lib');
const { TAU, sheet, P } = require('./paper');

// 眨眼：每隔几秒闭一下，seed 不同的角色错开眨
function blink(t, seed = 0, period = 3.4) {
  const p = ((t + seed * 1.37) % period + period) % period;
  return p < 0.16 ? Math.sin(p / 0.16 * Math.PI) : 0;
}
// 弹性缓动：纸片“啪”地弹出来
const backOut = x => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
// 在 t0 时刻弹出，d 秒内从 0 到 1（带一点回弹）
const popIn = (t, t0, d = 0.35) => backOut((t - t0) / d);

function jujube(ctx, x, y, s) {
  sheet(ctx, P.ellipse(x, y, s * 0.8, s), '#c8382f', { blur: 3, sy: 2, edgeW: 1.3 });
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(x - s * 0.25, y - s * 0.35, s * 0.2, 0, TAU); ctx.fill();
  sheet(ctx, P.rrect(x - s * 0.08, y - s * 1.35, s * 0.16, s * 0.45, 2), '#6e4630', { shadow: false, edgeW: 1 });
}
function coin(ctx, x, y, s, spin = 0) {
  const sx = Math.max(0.15, Math.abs(Math.cos(spin)));
  sheet(ctx, P.ellipse(x, y, s * sx, s), '#d8a24b', { blur: 4, sy: 2, edgeW: 1.4 });
  ctx.fillStyle = '#7a4c22'; ctx.fillRect(x - s * 0.28 * sx, y - s * 0.28, s * 0.56 * sx, s * 0.56);
}
function letter(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  sheet(ctx, P.rrect(-s, -s * 0.65, s * 2, s * 1.3, 3), '#f6ecd6', { blur: 4, sy: 2, edgeW: 1.4 });
  ctx.strokeStyle = '#c9a77c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s, -s * 0.65); ctx.lineTo(0, s * 0.1); ctx.lineTo(s, -s * 0.65); ctx.stroke();
  sheet(ctx, P.circle(0, s * 0.1, s * 0.18), '#c8382f', { shadow: false, edgeW: 1 });
  ctx.restore();
}
// 包袱（可带上面冒出的小物件 items:false 关闭）
function bundle(ctx, x, y, s, t = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || Math.sin(t * 1.6) * 0.04);
  sheet(ctx, P.ellipse(0, 0, s, s * 0.82), o.color || '#c98b5a', { blur: 12 });
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#f4dcb8';
  const r = rng(3);
  for (let i = 0; i < 26; i++) { const a = r() * TAU, d = Math.sqrt(r()) * s * 0.78; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d * 0.8, s * 0.035, 0, TAU); ctx.fill(); }
  ctx.restore();
  if (o.items !== false) {
    letter(ctx, -s * 0.42, -s * 0.86, s * 0.2, -0.3);
    coin(ctx, s * 0.45, -s * 0.8, s * 0.16, t * 2);
    jujube(ctx, s * 0.05, -s * 0.95, s * 0.09); jujube(ctx, s * 0.2, -s * 0.88, s * 0.08);
  }
  sheet(ctx, c => { c.moveTo(-s * 0.3, -s * 0.72); c.quadraticCurveTo(0, -s * 1.08, s * 0.3, -s * 0.72); c.quadraticCurveTo(0, -s * 0.86, -s * 0.3, -s * 0.72); }, '#a86c42', { blur: 4 });
  ctx.restore();
}
function scissors(ctx, x, y, s, open, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  for (const sg of [-1, 1]) {
    ctx.save(); ctx.rotate(sg * open);
    sheet(ctx, c => { c.moveTo(0, -s * 0.06 * sg); c.quadraticCurveTo(s * 0.6, -s * 0.1 * sg, s * 1.1, 0); c.quadraticCurveTo(s * 0.6, s * 0.04 * sg, 0, s * 0.06 * sg); c.closePath(); }, '#cfd6dc', { blur: 5, sy: 3 });
    ctx.save(); ctx.translate(-s * 0.42, sg * s * 0.1);
    sheet(ctx, c => { c.ellipse(0, 0, s * 0.22, s * 0.15, 0, 0, TAU); c.moveTo(s * 0.12, 0); c.ellipse(0, 0, s * 0.12, s * 0.07, 0, 0, TAU, true); }, '#d24f45', { blur: 4, sy: 2 });
    ctx.restore();
    ctx.restore();
  }
  sheet(ctx, P.circle(0, 0, s * 0.06), '#8a949c', { shadow: false, edgeW: 1 });
  ctx.restore();
}
function bolt(ctx, x, y, s, seed) {
  const r = rng(seed);
  const pts = [[0, 0]];
  let cx = 0, cy = 0;
  for (let i = 0; i < 5; i++) { cx += (i % 2 ? 1 : -1) * s * (0.12 + r() * 0.1); cy += s * (0.16 + r() * 0.06); pts.push([cx, cy]); }
  const left = pts.map(([a, b]) => [x + a - s * 0.05, y + b]), right = pts.slice().reverse().map(([a, b]) => [x + a + s * 0.05, y + b + s * 0.04]);
  left.push([x + cx, y + cy + s * 0.15]);
  sheet(ctx, P.poly([...left, ...right]), '#f7d36b', { blur: 14, sy: 4, shadowA: 0.3 });
}
// 圆形纸片里的一个字或符号（？、！、咔、z 等拟声/情绪）
function chip(ctx, ch, x, y, s, rot = 0, fill = '#fbf6ec', color = '#3a2c26') {
  if (s <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  sheet(ctx, P.circle(0, 0, s), fill, { blur: 6, sy: 3 });
  ctx.fillStyle = color; ctx.font = `${s * 1.2}px Kai`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ch, 0, s * 0.06);
  ctx.restore();
}
function heart(ctx, x, y, s, fill = '#e2675c') {
  if (s <= 0) return;
  sheet(ctx, c => { c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.4, y, x - s * 0.6, y - s * 0.9, x, y - s * 0.2); c.bezierCurveTo(x + s * 0.6, y - s * 0.9, x + s * 1.4, y, x, y + s * 0.9); }, fill, { blur: 6, sy: 3 });
}

module.exports = { blink, backOut, popIn, jujube, coin, letter, bundle, scissors, bolt, chip, heart };
