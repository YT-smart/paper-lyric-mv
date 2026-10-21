// 舞台：背景、镜头、星星、水、光圈隧道等通用布景
const { clamp, frac, rng } = require('./lib');
const { W, H, TAU, sheet, P, tornRidge } = require('./paper');

// 竖直渐变背景
const vbg = (ctx, c1, c2) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
// 整屏蒙一层颜色（闪白、压暗、淡入淡出）
const overlay = (ctx, col, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); };
// 镜头：以 (cx,cy) 为画面中心放大 z 倍。用法 ctx.save(); camera(...); 画; ctx.restore();
function camera(ctx, cx, cy, z) { ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy); }

function star(ctx, x, y, s, rot = 0) {
  if (s <= 0) return;
  const pts = []; for (let i = 0; i < 10; i++) { const a = rot + i / 10 * TAU - Math.PI / 2, r = i % 2 ? s * 0.45 : s; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  sheet(ctx, P.poly(pts), '#f3d27a', { blur: 4, sy: 2, edgeW: 1.4 });
}
// 一组固定位置的星星 [x, y, 大小, 旋转]，y 在上半屏，可乘系数铺满
const STARS = (() => { const r = rng(4); return Array.from({ length: 26 }, () => [r() * W, r() * H * 0.5, 6 + r() * 9, r() * TAU]); })();

// 流动的河面（多层撕纸波浪）
function river(ctx, t, base, cols) {
  cols.forEach((c, i) => tornRidge(ctx, x => base + i * 38 + Math.sin(x / 140 + t * (1.2 + i * 0.3) + i) * 12, c, 40 + i, { rough: 3, blur: 8, shadowA: 0.25 }));
}
// 水下：渐变 + 光束；depth 0~1 越大越深越暗
function water(ctx, t, depth) {
  vbg(ctx, depth < 0.5 ? '#4aa3b0' : '#2e7f90', depth < 0.5 ? '#2a6f82' : '#164a5c');
  overlay(ctx, '#0f3442', depth * 0.45);
  ctx.save(); ctx.globalAlpha = 0.1 * (1 - depth * 0.7); ctx.fillStyle = '#fffbea';
  for (let i = 0; i < 6; i++) { const x = 150 + i * 330 + Math.sin(t * 0.4 + i) * 40; ctx.beginPath(); ctx.moveTo(x - 40, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 240, H); ctx.lineTo(x + 40, H); ctx.fill(); }
  ctx.restore();
}
const BUB = (() => { const r = rng(9); return Array.from({ length: 34 }, () => ({ x: r() * W, o: r(), s: 6 + r() * 16, v: 0.08 + r() * 0.12 })); })();
function bubbles(ctx, t, sp = 1) {
  for (const b of BUB) { const y = H + 40 - frac(b.o + t * b.v * sp) * (H + 80); sheet(ctx, P.circle(b.x + Math.sin(t * 2 + b.o * 9) * 8, y, b.s), 'rgba(225,246,250,0.55)', { blur: 3, sy: 1, shadowA: 0.12, edgeW: 1.6 }); }
}
const KELP = (() => { const r = rng(10); return Array.from({ length: 16 }, (_, i) => ({ x: i * 130 + r() * 60, h: 160 + r() * 260, c: r() < 0.5 ? '#3f8a6a' : '#55a07a', ph: r() * TAU })); })();
function kelp(ctx, k, base, t) {
  const sw = Math.sin(t * 1.2 + k.ph) * 30;
  sheet(ctx, c => { c.moveTo(k.x - 14, base); c.bezierCurveTo(k.x - 30 + sw * 0.3, base - k.h * 0.4, k.x + sw, base - k.h * 0.7, k.x + sw * 1.3, base - k.h); c.bezierCurveTo(k.x + 16 + sw, base - k.h * 0.7, k.x + 20 + sw * 0.3, base - k.h * 0.4, k.x + 14, base); c.closePath(); }, k.c, { blur: 6, sy: 3, edgeW: 1.6 });
}
function fish(ctx, x, y, s, dir, col) {
  sheet(ctx, P.poly([[x - dir * s * 0.8, y], [x - dir * s * 1.3, y - s * 0.4], [x - dir * s * 1.3, y + s * 0.4]]), col, { blur: 4, sy: 2, edgeW: 1.3 });
  sheet(ctx, P.ellipse(x, y, s, s * 0.55), col, { blur: 4, sy: 2, edgeW: 1.3 });
  ctx.fillStyle = '#2b2220'; ctx.beginPath(); ctx.arc(x + dir * s * 0.5, y - s * 0.1, s * 0.1, 0, TAU); ctx.fill();
}

// 纸片光圈隧道：一圈圈彩色纸环从中心往外扩，适合“穿越”“转场”“奔跑”
const RING_COLS = ['#f6e7c8', '#f2c6a0', '#e9a17f', '#f3d27a', '#c9dcc8', '#e8b9a6', '#f9dfa8'];
function rings(ctx, cx, cy, t, t0, speed, a, cols = RING_COLS) {
  if (a <= 0) return;
  const N = 10, lt = t - t0;
  const list = [];
  for (let k = 0; k < N; k++) list.push([frac(k / N + lt * speed), k]);
  list.sort((u, v) => v[0] - u[0]);
  ctx.save(); ctx.globalAlpha = a;
  for (const [p, k] of list) {
    const rad = 26 * Math.exp(p * 3.9);
    sheet(ctx, P.circle(cx + Math.sin(p * 4 + t) * 10, cy, rad), cols[(k + Math.floor(lt * speed)) % cols.length], { blur: 18, sy: 6, shadowA: 0.3, edgeW: 3 });
  }
  ctx.restore();
}

module.exports = { vbg, overlay, camera, star, STARS, river, water, bubbles, kelp, KELP, fish, rings, RING_COLS };
