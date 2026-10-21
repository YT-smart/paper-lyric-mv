// 布景与表演工具：回忆滤镜、拥抱、房子、灯笼、窗、婴儿床、绘本、墓碑、花、火车、纸船、鲸鱼、城市、思考气泡
const { clamp, lerp, ss, frac, rng } = require('./lib');
const { W, H, TAU, sheet, P, cloud, person } = require('./paper');
const { blink, heart } = require('./props');

// 回忆滤镜：泛黄 + 照片白边。前世/回忆段落统一加上，观众一眼就知道“这是过去”
function memoryLook(ctx, a = 1) {
  if (a <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.32 * a; ctx.fillStyle = '#e9c9a0'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  const b = 26;
  ctx.fillStyle = '#f7efe1';
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(b, b, W - 2 * b, H - 2 * b); ctx.fill('evenodd');
  ctx.strokeStyle = 'rgba(120,80,50,0.25)'; ctx.lineWidth = 3; ctx.strokeRect(b, b, W - 2 * b, H - 2 * b);
  ctx.restore();
}

// 两个人相拥（A 在左、B 在右；A、B 是角色参数对象，必须带 h）
function hug(ctx, x, y, A, B, t, o = {}) {
  const gap = o.gap ?? 0.12;
  const lift = o.lift || 0;
  const hA = A.h, hB = B.h;
  person(ctx, { ...A, x: x - hA * gap, y, armL: 0.3, armR: 1.25, turn: 0.5, expr: A.expr || 'happy', blink: blink(t, 1), t });
  person(ctx, { ...B, x: x + hB * gap, y: y - lift, armL: 1.25, armR: 0.3, turn: -0.5, expr: B.expr || 'happy', blink: blink(t, 2), t });
  if (o.hearts !== false) {
    for (let i = 0; i < 3; i++) {
      const p = frac(t * 0.5 + i / 3);
      ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI);
      heart(ctx, x + Math.sin(i * 2.3 + t) * 60, y - Math.max(hA, hB) * 1.05 - p * 120, 16 + i * 4);
      ctx.restore();
    }
  }
}

// 老房子（瓦顶）
function house(ctx, x, base, w, h, wall, roof, o = {}) {
  sheet(ctx, P.rrect(x, base - h, w, h, 4), wall, { blur: 10 });
  sheet(ctx, c => { c.moveTo(x - w * 0.12, base - h + 4); c.quadraticCurveTo(x + w * 0.1, base - h - 6, x + w * 0.15, base - h - w * 0.3); c.lineTo(x + w * 0.85, base - h - w * 0.3); c.quadraticCurveTo(x + w * 0.9, base - h - 6, x + w * 1.12, base - h + 4); c.closePath(); }, roof, { blur: 8 });
  if (o.door) sheet(ctx, P.rrect(x + w * 0.4, base - h * 0.55, w * 0.22, h * 0.55, 3), '#8a5a3a', { blur: 4, sy: 2 });
  if (o.win !== false) sheet(ctx, P.rrect(x + w * 0.12, base - h * 0.7, w * 0.2, h * 0.25, 3), o.lit ? '#f9d98a' : '#c9b79a', { blur: 3, sy: 2 });
}
function lantern(ctx, x, y, s, t, col = '#d9473b') {
  const sw = Math.sin(t * 1.5 + x) * 0.08;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
  ctx.strokeStyle = '#5a3a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -s * 1.4); ctx.lineTo(0, -s * 0.8); ctx.stroke();
  sheet(ctx, P.ellipse(0, 0, s * 0.8, s * 0.85), col, { blur: 8, sy: 3 });
  sheet(ctx, P.rrect(-s * 0.4, -s * 0.95, s * 0.8, s * 0.2, 2), '#e8b04a', { blur: 2, sy: 1, edgeW: 1 });
  sheet(ctx, P.rrect(-s * 0.4, s * 0.75, s * 0.8, s * 0.2, 2), '#e8b04a', { blur: 2, sy: 1, edgeW: 1 });
  ctx.restore();
}

// 窗户：sky 可以是颜色，也可以是函数 (ctx,x,y,w,h) 自己画窗外
function windowFrame(ctx, x, y, w, h, sky, o = {}) {
  sheet(ctx, P.rrect(x - 14, y - 14, w + 28, h + 28, 8), o.frame || '#d9b48f', { blur: 12 });
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (typeof sky === 'function') sky(ctx, x, y, w, h); else { ctx.fillStyle = sky; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  ctx.save(); ctx.strokeStyle = o.frame || '#d9b48f'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke(); ctx.restore();
}

// 婴儿床：先 front=false 画床背板，再画婴儿，最后 front=true 画栏杆
function crib(ctx, x, y, w, t, front) {
  const h = w * 0.55;
  if (!front) { sheet(ctx, P.rrect(x - w / 2, y - h, w, h, 18), '#f3e6cf', { blur: 12 }); return; }
  sheet(ctx, P.rrect(x - w / 2 - 20, y - h * 0.45, w + 40, 26, 10), '#e0b98c', { blur: 8 });
  for (let i = 0; i <= 10; i++) sheet(ctx, P.rrect(x - w / 2 + i * w / 10 - 7, y - h * 0.45, 14, h * 0.45 + 30, 7), '#e9c79d', { blur: 4, sy: 2, edgeW: 1.4 });
  sheet(ctx, P.rrect(x - w / 2 - 20, y + 10, w + 40, 30, 10), '#e0b98c', { blur: 8 });
}
function mobile(ctx, x, y, t) {
  ctx.save(); ctx.strokeStyle = '#a07a5a'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, y - 200); ctx.lineTo(x, y - 120); ctx.stroke();
  sheet(ctx, P.ellipse(x, y - 120, 150, 14), '#e0b98c', { blur: 4, sy: 2 });
  const items = [['star', '#f3d27a'], ['moon', '#f6e7c0'], ['heart', '#e2675c'], ['cloud', '#fbf6ec']];
  items.forEach(([k, c], i) => {
    const a = t * 0.8 + i / items.length * TAU, ix = x + Math.cos(a) * 140, iy = y - 40 + Math.sin(a) * 10, sc = 0.8 + 0.2 * Math.sin(a);
    ctx.beginPath(); ctx.moveTo(ix, y - 120); ctx.lineTo(ix, iy - 20); ctx.stroke();
    if (k === 'heart') heart(ctx, ix, iy, 22 * sc);
    else if (k === 'cloud') cloud(ctx, ix, iy, 22 * sc, c, i);
    else sheet(ctx, P.circle(ix, iy, 22 * sc), c, { blur: 4, sy: 2 });
  });
  ctx.restore();
}

// 绘本：drawPage(ctx, 页码, 页中心x, 页中心y) 画每一页；flip 0~1 是翻页动画进度
function book(ctx, x, y, w, h, page, drawPage, flip) {
  sheet(ctx, P.rrect(x - w - 10, y - 10, w * 2 + 20, h + 20, 10), '#b6744d', { blur: 14 });
  sheet(ctx, P.rrect(x - w, y, w, h, 4), '#fbf6ec', { blur: 4, sy: 2 });
  sheet(ctx, P.rrect(x, y, w, h, 4), '#fbf6ec', { blur: 4, sy: 2 });
  ctx.save(); ctx.beginPath(); ctx.rect(x - w, y, w, h); ctx.clip(); drawPage(ctx, page - 1, x - w / 2, y + h / 2); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); drawPage(ctx, page, x + w / 2, y + h / 2); ctx.restore();
  if (flip > 0 && flip < 1) {
    const sx = Math.cos(flip * Math.PI);
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
    sheet(ctx, P.rrect(0, 0, w, h, 4), '#f3ead8', { blur: 6, sy: 3 });
    ctx.restore();
  }
}

function tombstone(ctx, x, base, s) {
  sheet(ctx, c => { c.moveTo(x - s * 0.5, base); c.lineTo(x - s * 0.5, base - s * 0.9); c.quadraticCurveTo(x - s * 0.5, base - s * 1.3, x, base - s * 1.3); c.quadraticCurveTo(x + s * 0.5, base - s * 1.3, x + s * 0.5, base - s * 0.9); c.lineTo(x + s * 0.5, base); c.closePath(); }, '#b7b4ad', { blur: 12 });
  ctx.save(); ctx.strokeStyle = 'rgba(80,76,70,0.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - s * 0.06, base - s * (1.0 - i * 0.17)); ctx.lineTo(x + s * 0.06, base - s * (1.0 - i * 0.17)); ctx.stroke(); }
  ctx.restore();
  sheet(ctx, P.rrect(x - s * 0.62, base - 8, s * 1.24, 24, 6), '#a29f98', { blur: 6 });
}
function flower(ctx, x, y, s, col, t = 0) {
  const sw = Math.sin(t * 1.4 + x * 0.01) * s * 0.15;
  ctx.save(); ctx.strokeStyle = '#5f8a4a'; ctx.lineWidth = Math.max(2, s * 0.12); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + sw, y - s * 1.2, x + sw * 2, y - s * 2.2); ctx.stroke(); ctx.restore();
  const fx = x + sw * 2, fy = y - s * 2.2;
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; sheet(ctx, P.circle(fx + Math.cos(a) * s * 0.45, fy + Math.sin(a) * s * 0.45, s * 0.42), col, { blur: 3, sy: 2, edgeW: 1.1 }); }
  sheet(ctx, P.circle(fx, fy, s * 0.3), '#f3d27a', { shadow: false, edgeW: 1 });
}

// 蒸汽火车（车头朝右）
function train(ctx, x, base, s, t) {
  const cars = [[0, '#3f4a5c'], [-s * 1.25, '#7a4a3a'], [-s * 2.45, '#7a4a3a']];
  for (const [dx, col] of cars) {
    sheet(ctx, P.rrect(x + dx - s * 0.55, base - s * 0.7, s * 1.1, s * 0.58, 10), col, { blur: 10 });
    for (let w = 0; w < 3; w++) sheet(ctx, P.rrect(x + dx - s * 0.45 + w * s * 0.33, base - s * 0.6, s * 0.22, s * 0.18, 4), '#f6e3b0', { blur: 2, sy: 1, edgeW: 1 });
    for (const wx of [-0.3, 0.3]) { ctx.save(); ctx.translate(x + dx + wx * s, base - s * 0.1); ctx.rotate(t * 6); sheet(ctx, P.circle(0, 0, s * 0.13), '#2b2a2e', { blur: 3, sy: 2 }); ctx.fillStyle = '#9a9aa2'; ctx.fillRect(-s * 0.1, -2, s * 0.2, 4); ctx.restore(); }
  }
  sheet(ctx, P.rrect(x + s * 0.2, base - s * 1.0, s * 0.18, s * 0.32, 4), '#2f3644', { blur: 4 });
  for (let i = 0; i < 4; i++) { const p = frac(t * 0.8 + i / 4); cloud(ctx, x + s * 0.3 - p * s * 1.6, base - s * 1.1 - p * s * 0.8, s * (0.12 + p * 0.22), `rgba(240,236,228,${1 - p})`, i + 20); }
}

// 纸船：part='sail' 只画帆、'hull' 只画船身——人物夹在两者之间画，才像坐在船里
function boat(ctx, x, y, s, t, part = 'all') {
  const rk = Math.sin(t * 1.4) * 0.05;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rk);
  if (part !== 'hull') sheet(ctx, P.poly([[s * 0.35, -s * 0.15], [s * 0.35, -s * 1.1], [s * 0.95, -s * 0.15]]), '#f3d27a', { blur: 8 });
  if (part !== 'sail') sheet(ctx, P.poly([[-s, -s * 0.15], [s, -s * 0.15], [s * 0.7, s * 0.3], [-s * 0.7, s * 0.3]]), '#f6ecd6', { blur: 10 });
  ctx.restore();
}
function whale(ctx, x, y, s, t) {
  const fl = Math.sin(t * 2) * 0.15;
  sheet(ctx, c => { c.moveTo(-s * 1.1 + x, y); c.bezierCurveTo(-s * 1.0 + x, y - s * 0.75, s * 0.8 + x, y - s * 0.8, s * 1.15 + x, y - s * 0.1); c.bezierCurveTo(s * 0.9 + x, y + s * 0.45, -s * 0.6 + x, y + s * 0.4, -s * 1.1 + x, y); }, '#5f7fb0', { blur: 14 });
  sheet(ctx, c => { c.moveTo(x - s * 0.9, y + s * 0.12); c.bezierCurveTo(x - s * 0.3, y + s * 0.42, x + s * 0.6, y + s * 0.4, x + s * 1.0, y + s * 0.05); c.bezierCurveTo(x + s * 0.5, y + s * 0.2, x - s * 0.3, y + s * 0.2, x - s * 0.9, y + s * 0.12); }, '#dfe7f1', { blur: 4, sy: 2 });
  ctx.save(); ctx.translate(x - s * 1.05, y - s * 0.05); ctx.rotate(fl);
  sheet(ctx, P.poly([[0, 0], [-s * 0.5, -s * 0.4], [-s * 0.35, 0], [-s * 0.5, s * 0.35]]), '#5f7fb0', { blur: 8 });
  ctx.restore();
  ctx.fillStyle = '#2b2220'; ctx.beginPath(); ctx.arc(x + s * 0.6, y - s * 0.12, s * 0.06, 0, TAU); ctx.fill();
  for (let i = 0; i < 6; i++) sheet(ctx, P.circle(x - s * 0.4 + i * s * 0.22, y - s * 0.35 + Math.sin(i) * s * 0.05, s * 0.035), '#f3d27a', { shadow: false, edgeW: 0.8 });
}

// 城市楼群：litT(r) 返回每扇窗的亮度 0~1（r 是该窗的随机数，可用来让窗一扇扇亮起）
const CITY = (() => {
  const r = rng(131), back = [], front = [];
  for (let x = -40; x < W + 40;) { const w = 80 + r() * 120; back.push([x, w, 200 + r() * 320]); x += w - 10; }
  for (let x = -40; x < W + 40;) {
    const w = 110 + r() * 150, h = 160 + r() * 330, wins = [];
    for (let wy = 30; wy < h - 40; wy += 46) for (let wx = 20; wx < w - 30; wx += 38) wins.push([wx, wy, r()]);
    front.push([x, w, h, wins, ['#7b5a6e', '#6a4d66', '#80606a'][(r() * 3) | 0]]); x += w + 10 + r() * 20;
  }
  return { back, front };
})();
function city(ctx, base, litT, t, o = {}) {
  for (const [x, w, h] of CITY.back) sheet(ctx, P.rrect(x, base - h - 80, w, h + 80, 4), o.back || '#b3788a', { blur: 8, shadowA: 0.2 });
  for (const [x, w, h, wins, col] of CITY.front) {
    sheet(ctx, P.rrect(x, base - h, w, h, 4), col, { blur: 10 });
    for (const [wx, wy, r] of wins) {
      const on = litT(r);
      ctx.fillStyle = on > 0 ? `rgba(255,214,130,${0.35 + 0.65 * on})` : 'rgba(60,40,60,0.45)';
      ctx.fillRect(x + wx, base - h + wy, 22, 28);
    }
  }
}

// 思考气泡：从 (fromX,fromY) 冒三个小泡到大云朵，drawIn(ctx,x,y) 画里面的内容
function thought(ctx, x, y, w, h, fromX, fromY, a, drawIn) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  for (let i = 0; i < 3; i++) { const p = (i + 1) / 4; sheet(ctx, P.circle(lerp(fromX, x, p), lerp(fromY, y + h * 0.4, p), 8 + i * 6), '#fdfaf3', { blur: 4, sy: 2 }); }
  sheet(ctx, c => {
    const n = 9;
    for (let i = 0; i <= n; i++) { const a2 = i / n * TAU; const px = x + Math.cos(a2) * w, py = y + Math.sin(a2) * h; if (i === 0) c.moveTo(px, py); else { const am = (i - 0.5) / n * TAU; c.quadraticCurveTo(x + Math.cos(am) * w * 1.25, y + Math.sin(am) * h * 1.25, px, py); } }
  }, '#fdfaf3', { blur: 10 });
  if (drawIn) drawIn(ctx, x, y);
  ctx.restore();
}

module.exports = { CITY, memoryLook, hug, house, lantern, windowFrame, crib, mobile, book, tombstone, flower, train, boat, whale, city, thought };
