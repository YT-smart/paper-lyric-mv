// 纸艺渲染：纸纹、撕边、白描边纸片、可爱角色、纸片字幕
const { createCanvas } = require('@napi-rs/canvas');
const { clamp, lerp, rng, rgba } = require('./lib');

const W = 1920, H = 1080, TAU = Math.PI * 2;

// ---------- 纸纹（整帧最后 multiply 一层；数值调得很轻，太重会显脏） ----------
const PAPER = (() => {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const lo = createCanvas(240, 135), lg = lo.getContext('2d');
  const r = rng(5);
  const li = lg.createImageData(240, 135);
  for (let i = 0; i < li.data.length; i += 4) { const v = 238 + r() * 17; li.data[i] = li.data[i + 1] = li.data[i + 2] = v; li.data[i + 3] = 255; }
  lg.putImageData(li, 0, 0);
  g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, W, H);
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let y = 0; y < H; y++) {
    let fiber = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      fiber = fiber * 0.9 + (r() - 0.5) * 2.2;
      const v = clamp(d[i] + (r() - 0.5) * 12 + fiber, 0, 255);
      d[i] = v; d[i + 1] = v * 0.985; d[i + 2] = v * 0.95;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
})();
function paperTexture(ctx, a = 1) {
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.drawImage(PAPER, 0, 0); ctx.restore();
}

// ---------- 纸片绘制 ----------
// 用一个路径函数画一张纸：投影 + 填充 + 白色纸芯描边。这是整个风格的核心
function sheet(ctx, path, fill, o = {}) {
  ctx.save();
  if (o.shadow !== false) {
    ctx.shadowColor = `rgba(40,24,18,${o.shadowA ?? 0.32})`; ctx.shadowBlur = o.blur ?? 10;
    ctx.shadowOffsetX = o.sx ?? 2; ctx.shadowOffsetY = o.sy ?? 5;
  }
  ctx.beginPath(); path(ctx);
  ctx.fillStyle = fill; ctx.fill();
  ctx.shadowColor = 'transparent';
  if (o.edge !== false) {
    ctx.lineWidth = o.edgeW ?? 2.6; ctx.lineJoin = 'round';
    ctx.strokeStyle = o.edgeC || 'rgba(255,251,242,0.92)'; ctx.stroke();
  }
  ctx.restore();
}
// 常用形状路径
const P = {
  circle: (x, y, r) => c => c.arc(x, y, r, 0, TAU),
  ellipse: (x, y, rx, ry, rot = 0) => c => c.ellipse(x, y, rx, ry, rot, 0, TAU),
  rrect: (x, y, w, h, r) => c => { r = Math.min(r, w / 2, h / 2); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  poly: pts => c => { pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); },
};
// 撕纸边地形：fn(x) 给出每个 x 的高度，加细碎抖动
function tornRidge(ctx, fn, fill, seed, o = {}) {
  const r = rng(seed);
  const pts = [];
  let j = 0;
  for (let x = -20; x <= W + 20; x += 7) { j = j * 0.6 + (r() - 0.5) * (o.rough ?? 5); pts.push([x, fn(x) + j]); }
  sheet(ctx, c => { c.moveTo(-20, H + 20); pts.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(W + 20, H + 20); c.closePath(); }, fill, o);
}
// 纸云
function cloud(ctx, x, y, s, fill = '#fbf6ee', seed = 1) {
  const r = rng(seed);
  const bumps = [[-1.1, 0.1, 0.55], [-0.5, -0.25, 0.7], [0.2, -0.35, 0.8], [0.85, -0.05, 0.6], [1.3, 0.15, 0.45]];
  sheet(ctx, c => {
    c.moveTo(x - 1.6 * s, y + 0.4 * s);
    for (const [bx, by, br] of bumps) c.arc(x + bx * s, y + by * s, br * s * (0.9 + r() * 0.2), Math.PI, TAU);
    c.lineTo(x + 1.8 * s, y + 0.4 * s); c.closePath();
  }, fill, { sy: 4, blur: 8, shadowA: 0.18 });
}

// ---------- 角色 ----------
const SKIN = '#f6d9c0', BLUSH = 'rgba(240,120,120,0.45)', INK = '#2b2220';

function arm(ctx, px, py, side, ang, len, w, sleeve, skin) {
  ctx.save(); ctx.translate(px, py); ctx.rotate(side < 0 ? ang : -ang);
  sheet(ctx, P.rrect(-w / 2, -w * 0.3, w, len, w / 2), sleeve, { blur: 6, sy: 3, shadowA: 0.25 });
  sheet(ctx, P.circle(0, len, w * 0.48), skin, { blur: 4, sy: 2, shadowA: 0.2, edgeW: 1.8 });
  ctx.restore();
}

// 表情：smile 微笑 / happy 眯眼笑 / laugh 张嘴大笑 / o 惊讶 / sad 难过 / cry 哭 / worry 担心 / calm 平静 / sleep 睡着
function face(ctx, cx, cy, R, o) {
  const tx = (o.turn || 0) * R * 0.25;
  const ex = R * 0.36, ey = cy + R * 0.12;
  const blink = o.blink || 0;
  ctx.save();
  ctx.fillStyle = BLUSH;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + tx + s * R * 0.58, cy + R * 0.38, R * 0.16, R * 0.1, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, R * 0.06);
  const e = o.expr || 'smile';
  for (const s of [-1, 1]) {
    const x = cx + tx + s * ex;
    if (e === 'happy' || blink > 0.85 || e === 'sleep') {
      ctx.beginPath();
      if (e === 'sleep' || blink > 0.85) ctx.arc(x, ey - R * 0.02, R * 0.1, 0.15 * Math.PI, 0.85 * Math.PI);
      else ctx.arc(x, ey + R * 0.04, R * 0.1, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
    } else {
      const ry = R * (e === 'o' ? 0.17 : 0.14) * (1 - blink);
      ctx.beginPath(); ctx.ellipse(x, ey, R * 0.11, Math.max(1, ry), 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + R * 0.035 + tx * 0.1, ey - ry * 0.4, R * 0.045, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(x - R * 0.04, ey + ry * 0.35, R * 0.022, 0, TAU); ctx.fill();
      ctx.fillStyle = INK;
    }
    if (e === 'sad' || e === 'cry' || e === 'worry') {
      ctx.beginPath(); ctx.moveTo(x - s * R * 0.12, ey - R * 0.3); ctx.lineTo(x + s * R * 0.08, ey - R * 0.22); ctx.stroke();
    }
  }
  const mx = cx + tx, my = cy + R * 0.45;
  ctx.beginPath();
  if (e === 'o') { ctx.ellipse(mx, my, R * 0.07, R * 0.09, 0, 0, TAU); ctx.fill(); }
  else if (e === 'sad' || e === 'cry') { ctx.arc(mx, my + R * 0.09, R * 0.1, 1.2 * Math.PI, 1.8 * Math.PI); ctx.stroke(); }
  else if (e === 'calm' || e === 'sleep' || e === 'worry') { ctx.moveTo(mx - R * 0.06, my); ctx.lineTo(mx + R * 0.06, my); ctx.stroke(); }
  else if (e === 'laugh') { ctx.moveTo(mx - R * 0.13, my - R * 0.03); ctx.quadraticCurveTo(mx, my + R * 0.22, mx + R * 0.13, my - R * 0.03); ctx.closePath(); ctx.fillStyle = '#9a3b3b'; ctx.fill(); }
  else { ctx.arc(mx, my - R * 0.06, R * 0.11, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  if (e === 'cry') {
    ctx.fillStyle = 'rgba(140,200,240,0.9)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + tx + s * ex, ey + R * 0.28 + (o.t || 0) % 1 * R * 0.3, R * 0.04, R * 0.07, 0, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}

// 发型：boy 短发（头顶一根小芽） / long 长发 / bob 齐耳短发 / ponytail 马尾 / none 无
function hairBack(ctx, cx, cy, R, o) {
  const s = o.hairStyle, col = o.hair;
  if (s === 'long') sheet(ctx, P.rrect(cx - R * 1.12, cy - R * 0.9, R * 2.24, R * 2.6, R * 1.05), col, { blur: 8 });
  if (s === 'bob') sheet(ctx, P.rrect(cx - R * 1.1, cy - R * 0.9, R * 2.2, R * 1.95, R * 0.9), col, { blur: 8 });
  if (s === 'ponytail') {
    const d = o.ponySide || 1, sw = Math.sin((o.t || 0) * 2.2) * 0.1;
    ctx.save(); ctx.translate(cx + d * R * 0.78, cy - R * 0.62); ctx.rotate(-d * (0.35 + sw));
    sheet(ctx, c => {
      c.moveTo(-R * 0.2, 0);
      c.bezierCurveTo(d * R * 0.9, R * 0.1, d * R * 0.75, R * 1.0, d * R * 0.35, R * 1.45);
      c.bezierCurveTo(d * R * 0.4, R * 0.9, -d * R * 0.05, R * 0.5, -R * 0.2, 0);
    }, col, { blur: 6 });
    sheet(ctx, P.circle(d * R * 0.12, R * 0.12, R * 0.12), o.tie || '#d24f45', { blur: 3, sy: 2, edgeW: 1.4 });
    ctx.restore();
  }
}
function hairFront(ctx, cx, cy, R, o) {
  const s = o.hairStyle, col = o.hair;
  if (s === 'none') return;
  const tx = (o.turn || 0) * R * 0.15;
  const side = s === 'long' ? R * 1.45 : s === 'bob' ? R * 0.8 : 0;
  sheet(ctx, c => {
    if (side) {
      // 两侧垂发与头顶连成一片（分开画会像耳机）
      c.moveTo(cx - R * 0.8, cy + side);
      c.quadraticCurveTo(cx - R * 1.12, cy + side * 0.5, cx - R * 1.1, cy);
      c.arc(cx, cy, R * 1.1, Math.PI, TAU);
      c.quadraticCurveTo(cx + R * 1.12, cy + side * 0.5, cx + R * 0.8, cy + side);
      c.quadraticCurveTo(cx + R * 0.72, cy + side * 0.4, cx + R * 0.86, cy - R * 0.1);
    } else {
      c.arc(cx, cy, R * 1.05, Math.PI * 0.94, Math.PI * 2.06);
    }
    const n = 4, y0 = cy - R * 0.12, span = side ? 1.72 : 2.0;
    for (let i = 0; i <= n; i++) {
      const x = cx + R * span / 2 - (i / n) * R * span + tx;
      c.quadraticCurveTo(x + R * 0.22, y0 + R * 0.28, x, y0 + (i % 2 ? 0 : R * 0.05));
    }
    if (side) c.quadraticCurveTo(cx - R * 0.72, cy + side * 0.4, cx - R * 0.8, cy + side);
    c.closePath();
  }, col, { blur: 5, sy: 3, shadowA: 0.25 });
  if (s === 'boy' && o.sprout !== false) {
    ctx.save(); ctx.translate(cx + R * 0.1, cy - R * 1.02); ctx.rotate(0.3 + Math.sin((o.t || 0) * 3) * 0.12);
    sheet(ctx, c => { c.moveTo(0, 0); c.quadraticCurveTo(R * 0.35, -R * 0.15, R * 0.3, -R * 0.42); c.quadraticCurveTo(R * 0.05, -R * 0.3, 0, 0); }, col, { blur: 3, sy: 2, edgeW: 1.6 });
    ctx.restore();
  }
}
// 帽子：army 军帽 / cap 鸭舌礼帽 / doctor 手术帽；mask: true 口罩
function hat(ctx, cx, cy, R, o) {
  if (o.hat === 'army') {
    sheet(ctx, c => { c.moveTo(cx - R * 1.05, cy - R * 0.35); c.quadraticCurveTo(cx, cy - R * 1.45, cx + R * 1.05, cy - R * 0.35); c.closePath(); }, '#5d6b45');
    sheet(ctx, P.rrect(cx - R * 1.15, cy - R * 0.45, R * 2.3, R * 0.22, R * 0.1), '#46522f', { blur: 4 });
    sheet(ctx, P.circle(cx, cy - R * 0.72, R * 0.1), '#c94a3a', { blur: 2, edgeW: 1.2 });
  } else if (o.hat === 'cap') {
    sheet(ctx, c => { c.moveTo(cx - R * 1.05, cy - R * 0.3); c.quadraticCurveTo(cx, cy - R * 1.5, cx + R * 1.05, cy - R * 0.3); c.closePath(); }, o.hatColor || '#4a4a52');
    sheet(ctx, P.ellipse(cx + (o.turn || 0) * R * 0.3, cy - R * 0.32, R * 1.25, R * 0.16), o.hatColor2 || '#3a3a42', { blur: 3 });
  } else if (o.hat === 'doctor') {
    sheet(ctx, c => { c.moveTo(cx - R * 1.06, cy - R * 0.25); c.quadraticCurveTo(cx, cy - R * 1.55, cx + R * 1.06, cy - R * 0.25); c.closePath(); }, '#8fc4b8');
  }
  if (o.mask) {
    sheet(ctx, P.rrect(cx - R * 0.62, cy + R * 0.22, R * 1.24, R * 0.62, R * 0.2), '#bfe0dc', { blur: 3, sy: 2 });
    ctx.save(); ctx.strokeStyle = 'rgba(120,160,160,0.7)'; ctx.lineWidth = 2;
    for (const k of [0.38, 0.55, 0.7]) { ctx.beginPath(); ctx.moveTo(cx - R * 0.5, cy + R * k); ctx.lineTo(cx + R * 0.5, cy + R * k); ctx.stroke(); }
    ctx.restore();
  }
}

// 主角色。y 为脚底，h 为身高。完整参数见 references/engine-api.md
function person(ctx, o) {
  const { x, y, h } = o;
  const adult = o.kind === 'adult';
  const R = adult ? h * 0.115 : h * 0.205;
  const bob = (o.walkAmt || 0) * Math.abs(Math.sin(o.walk || 0)) * h * 0.02 + (o.hop || 0);
  const cy0 = y - h + R - bob;
  const cx = x + (o.lean || 0) * h * 0.04;
  const neck = cy0 + R * 0.95;
  const hemY = adult ? (o.dress ? y - h * 0.06 : y - h * 0.33) : y - h * 0.2;
  const shW = adult ? h * 0.085 : h * 0.11, hemW = adult ? (o.dress ? h * 0.2 : h * 0.13) : h * 0.16;
  const skin = o.skin || SKIN;
  const legW = adult ? h * 0.06 : h * 0.075;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  hairBack(ctx, cx, cy0, R, o);
  // 腿
  if (!(adult && o.dress)) {
    for (const s of [-1, 1]) {
      const sw = Math.sin((o.walk || 0) + (s > 0 ? 0 : Math.PI)) * (o.walkAmt || 0);
      const lx = x + s * h * (adult ? 0.045 : 0.06), top = hemY - h * 0.03 - bob;
      const lift = Math.max(0, sw) * h * 0.05;
      sheet(ctx, P.rrect(lx - legW / 2 + sw * h * 0.03, top, legW, y - top - lift - h * 0.03, legW * 0.4), o.pants || '#3d4a66', { blur: 5, sy: 3 });
      sheet(ctx, P.ellipse(lx + sw * h * 0.03 + s * h * 0.01, y - h * 0.025 - lift, h * (adult ? 0.05 : 0.065), h * 0.03), o.shoe || '#5a2e2a', { blur: 3, sy: 2, edgeW: 1.6 });
    }
  } else {
    for (const s of [-1, 1]) sheet(ctx, P.ellipse(x + s * h * 0.05, y - h * 0.018, h * 0.045, h * 0.022), o.shoe || '#5a2e2a', { blur: 3, sy: 2, edgeW: 1.6 });
  }
  const armLen = adult ? h * 0.3 : h * 0.24, armW = adult ? h * 0.055 : h * 0.07;
  const shY = neck + h * 0.03;
  // 躯干
  sheet(ctx, c => {
    c.moveTo(cx - shW, shY - h * 0.01); c.quadraticCurveTo(cx, shY - h * 0.035, cx + shW, shY - h * 0.01);
    c.lineTo(x + hemW, hemY - bob); c.quadraticCurveTo(x, hemY + h * 0.02 - bob, x - hemW, hemY - bob); c.closePath();
  }, o.coat || '#6f8fb8', { blur: 10 });
  if (o.buttons !== false && !o.dress) {
    ctx.save(); ctx.fillStyle = 'rgba(255,250,240,0.85)';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx + h * 0.005, shY + (hemY - shY) * (0.25 + i * 0.25) - bob, h * 0.008, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  if (o.belly) sheet(ctx, P.ellipse(x + h * 0.075, shY + (hemY - shY) * 0.5 - bob, h * 0.07, h * 0.1), o.coat || '#6f8fb8', { blur: 6, sy: 3 });
  if (o.belt) sheet(ctx, P.rrect(cx - shW * 1.05, shY + (hemY - shY) * 0.5 - bob, shW * 2.1, h * 0.025, 3), o.belt, { blur: 3, sy: 2, edgeW: 1.2 });
  // 手臂：角度 0 = 自然下垂，越大越往外抬，约 2.6 = 举过头顶
  arm(ctx, cx - shW * 0.85, shY + h * 0.01, -1, o.armL || 0.12, armLen, armW, o.sleeve || o.coat || '#6f8fb8', skin);
  arm(ctx, cx + shW * 0.85, shY + h * 0.01, 1, o.armR || 0.12, armLen, armW, o.sleeve || o.coat || '#6f8fb8', skin);
  if (o.scarf) {
    sheet(ctx, P.rrect(cx - R * 0.75, neck - R * 0.12, R * 1.5, R * 0.32, R * 0.15), o.scarf, { blur: 4, sy: 2 });
    sheet(ctx, P.rrect(cx + R * 0.25, neck + R * 0.05, R * 0.28, R * 0.75, R * 0.1), o.scarf, { blur: 4, sy: 2 });
  }
  sheet(ctx, P.circle(cx, cy0, R), skin, { blur: 10 });
  face(ctx, cx, cy0, R, o);
  hairFront(ctx, cx, cy0, R, o);
  hat(ctx, cx, cy0, R, o);
  ctx.restore();
  // 返回头和双手的位置，方便挂道具（例如手里递出的铜钱）
  const handPos = (side, ang) => {
    const px = cx + side * shW * 0.85, py = shY + h * 0.01;
    const a = side < 0 ? ang : -ang;
    return [px - Math.sin(a) * armLen, py + Math.cos(a) * armLen];
  };
  return { head: [cx, cy0, R], handL: handPos(-1, o.armL || 0.12), handR: handPos(1, o.armR || 0.12), shY };
}

// 特写用的头（可倾斜 tilt）
function head(ctx, cx, cy, R, o = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.tilt || 0);
  hairBack(ctx, 0, 0, R, o);
  sheet(ctx, P.circle(0, 0, R), o.skin || SKIN, { blur: 14 });
  face(ctx, 0, 0, R, o);
  hairFront(ctx, 0, 0, R, o);
  hat(ctx, 0, 0, R, o);
  ctx.restore();
}

// 婴儿（襁褓）：头朝左，小被子带一道翻折
function baby(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  const wrap = o.wrap || '#f1c9a5', fold = o.fold || '#fbe8d2';
  sheet(ctx, c => {
    c.moveTo(-s * 0.35, -s * 0.38);
    c.bezierCurveTo(s * 0.3, -s * 0.5, s * 0.95, -s * 0.3, s * 0.95, s * 0.02);
    c.bezierCurveTo(s * 0.95, s * 0.35, s * 0.3, s * 0.45, -s * 0.35, s * 0.36);
    c.closePath();
  }, wrap, { blur: 10 });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = s * 0.02; ctx.setLineDash([s * 0.05, s * 0.05]);
  ctx.beginPath(); ctx.moveTo(s * 0.35, -s * 0.36); ctx.quadraticCurveTo(s * 0.55, 0, s * 0.3, s * 0.38); ctx.stroke(); ctx.restore();
  sheet(ctx, c => { c.moveTo(-s * 0.2, -s * 0.42); c.quadraticCurveTo(s * 0.25, -s * 0.05, -s * 0.15, s * 0.4); c.quadraticCurveTo(-s * 0.55, s * 0.1, -s * 0.2, -s * 0.42); }, fold, { blur: 6, sy: 3 });
  const R = s * 0.3;
  sheet(ctx, P.circle(-s * 0.32, -s * 0.02, R), SKIN, { blur: 8 });
  face(ctx, -s * 0.32, -s * 0.02, R, { expr: o.expr || 'sleep', blink: o.blink, t: o.t });
  sheet(ctx, c => { c.moveTo(-s * 0.38, -s * 0.31); c.quadraticCurveTo(-s * 0.28, -s * 0.48, -s * 0.18, -s * 0.38); c.quadraticCurveTo(-s * 0.28, -s * 0.38, -s * 0.38, -s * 0.31); }, '#3a2a24', { blur: 2, edgeW: 1.2 });
  if (o.hand) sheet(ctx, P.circle(-s * 0.02, s * 0.0, s * 0.08), SKIN, { blur: 4, sy: 2, edgeW: 1.4 });
  ctx.restore();
}

// ---------- 字幕：每个字一张小纸片，逐字弹出，highlight 里的字用红纸 ----------
function lyricChips(ctx, text, t, t0, t1, o = {}) {
  const chars = [...text];
  const size = o.size || 46, pad = size * 0.22;
  ctx.save();
  ctx.font = `${size}px ${o.font || 'Kai'}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const cw = size + pad * 2;
  const widths = chars.map(c => c === ' ' ? size * 0.4 : cw);
  const total = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * 4;
  let x = (o.x ?? W / 2) - total / 2;
  const y = o.y ?? H * 0.88;
  const dur = Math.max(0.6, t1 - t0), stag = Math.min(0.07, dur * 0.4 / chars.length);
  const out = 1 - clamp((t - (t1 - 0.25)) / 0.35);
  chars.forEach((ch, i) => {
    const w = widths[i];
    if (ch !== ' ') {
      const p = clamp((t - t0 - i * stag) / 0.28);
      if (p > 0 && out > 0) {
        const r = rng(i * 31 + Math.floor(t0 * 10));
        const pop = p < 1 ? 1 + Math.sin(p * Math.PI) * 0.18 : 1;
        const hl = o.highlight && o.highlight.includes(ch);
        ctx.save(); ctx.globalAlpha = Math.min(p * 1.5, 1) * out;
        ctx.translate(x + w / 2, y + (1 - p) * -18); ctx.rotate((r() - 0.5) * 0.12); ctx.scale(pop, pop);
        const big = hl ? 1.12 : 1;
        sheet(ctx, P.rrect(-cw / 2 * big, -cw / 2 * big, cw * big, cw * big, 4), hl ? '#d9534a' : '#fbf6ec', { blur: 6, sy: 3, shadowA: 0.35, edgeC: 'rgba(255,255,255,0.6)', edgeW: 1.4 });
        ctx.fillStyle = hl ? '#fff8ee' : '#3a2c26'; ctx.fillText(ch, 0, size * 0.04);
        ctx.restore();
      }
    }
    x += w + 4;
  });
  ctx.restore();
}

module.exports = { W, H, TAU, PAPER, paperTexture, sheet, P, tornRidge, cloud, person, baby, face, head, lyricChips, SKIN };
