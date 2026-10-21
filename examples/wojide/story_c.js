// 2:18–3:54：快来抱抱（副歌蒙太奇）→ 间奏渡星河 → 遇见年轻的外婆 → 时空是个圆圈
const { clamp, lerp, ss, easeInOut, easeOut, frac, rng } = require('./engine/lib');
const { W, H, TAU, sheet, P, cloud, tornRidge, person, baby, head } = require('./engine/paper');
const { blink, backOut, popIn, bundle, heart, chip } = require('./engine/props');
const { vbg, overlay, camera, star, STARS } = require('./engine/stage');
const K = require('./engine/kit');
const { CAST, YOUSOUL } = require('./cast');
const { jujubeBg, oldStreet } = require('./story_b');

// ---------- 副歌：婴儿床里哭着要抱，和每一世的拥抱交替 ----------
function nursery(ctx) {
  vbg(ctx, '#f6dccb', '#eec2ab');
  for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) star(ctx, 120 + i * 210 + (j % 2) * 100, 90 + j * 170, 10, 0.3);
  sheet(ctx, P.rrect(0, 900, W, 200, 0), '#c98f73', { blur: 12 });
}
function cribShot(ctx, t, mood) {
  nursery(ctx);
  K.mobile(ctx, W / 2, 330, t);
  K.crib(ctx, W / 2, 820, 900, t, false);
  const crying = mood === 'cry';
  const reach = crying ? 2.3 + Math.sin(t * 7) * 0.25 : 0.6 + Math.sin(t * 3) * 0.3;
  baby(ctx, W / 2, 700, 360, { expr: crying ? 'cry' : 'laugh', blink: blink(t, 3), rot: Math.sin(t * (crying ? 9 : 2)) * 0.03, t });
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(W / 2 - 60 + s * 70, 660); ctx.rotate(s * (Math.PI - reach * 0.5));
    sheet(ctx, P.rrect(-16, 0, 32, 90, 16), '#f1c9a5', { blur: 5, sy: 3 }); sheet(ctx, P.circle(0, 95, 22), '#f6d9c0', { blur: 3, sy: 2 });
    ctx.restore();
  }
  K.crib(ctx, W / 2, 820, 900, t, true);
  if (crying) for (let i = 0; i < 3; i++) {
    const p = frac(t * 1.6 + i / 3);
    ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI); ctx.strokeStyle = '#6f8fb8'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(W / 2 - 110, 620, 120 + p * 120 + i * 10, s < 0 ? Math.PI * 0.85 : -Math.PI * 0.15, s < 0 ? Math.PI * 1.15 : Math.PI * 0.15); ctx.stroke(); }
    ctx.restore();
  }
}
function hugMom(ctx, t) {
  vbg(ctx, '#f8d9c4', '#f0b9a0');
  ctx.save(); camera(ctx, W / 2, 560, 1 + 0.06 * ss(140, 142, t));
  const lift = easeOut(ss(140.0, 140.6, t));
  person(ctx, { ...CAST.mom, x: 960, y: 1180, h: 900, expr: 'happy', blink: blink(t, 1), armL: 1.0, armR: 1.0, t });
  baby(ctx, 980, lerp(1100, 700, lift), 300, { expr: 'laugh', rot: -0.3, t });
  sheet(ctx, P.ellipse(1080, lerp(1110, 720, lift), 46, 38), '#f6d9c0', { blur: 6 });
  for (let i = 0; i < 5; i++) { const p = frac(t * 0.6 + i / 5); ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI); heart(ctx, 760 + i * 100, 500 - p * 260, 20 + (i % 2) * 8); ctx.restore(); }
  ctx.restore();
}
function hugMemory(ctx, t, which) {
  if (which === 0) { jujubeBg(ctx, t, 0); K.hug(ctx, 960, 960, { ...CAST.soul, h: 300 }, { ...CAST.girl, h: 290 }, t); }
  else if (which === 1) {
    oldStreet(ctx, t, 400);
    const spin = (t - 153.7) * 4;
    ctx.save(); ctx.translate(960, 640); ctx.rotate(Math.sin(spin) * 0.15); ctx.translate(-960, -640);
    person(ctx, { ...CAST.uncle, x: 960, y: 960, h: 560, expr: 'laugh', armL: 2.3, armR: 2.3, t });
    person(ctx, { ...CAST.nephew, x: 960, y: 520 + Math.sin(spin) * 10, h: 240, expr: 'laugh', armL: 2.6, armR: 2.6, t });
    ctx.restore();
    for (let i = 0; i < 3; i++) heart(ctx, 760 + i * 200, 300 - frac(t * 0.6 + i / 3) * 150, 22);
  } else {
    vbg(ctx, '#d9c3ad', '#c3a78e');
    sheet(ctx, P.rrect(-20, 760, W + 40, 340, 0), '#a8968a', { blur: 12 });
    K.train(ctx, 1500, 760, 300, 0);
    K.hug(ctx, 900, 1000, { ...CAST.lover, h: 520 }, { ...CAST.soldier, h: 540 }, t);
  }
  K.memoryLook(ctx, 1);
}
// 副歌分切：每个时间点对应一句“呜”（婴儿哭）或“快来抱抱”（切到某一世的拥抱）
const CHORUS = [[138.0, 'cry'], [140.0, 'mom'], [142.0, 'cry'], [143.5, 'm0'], [147.0, 'happy'], [152.1, 'cry'], [153.7, 'm1'], [156.6, 'cry'], [157.4, 'm2'], [161.0, null]];
function shotChorus(ctx, t) {
  let k = 0; while (k < CHORUS.length - 1 && t >= CHORUS[k + 1][0]) k++;
  const kind = CHORUS[k][1];
  if (kind === 'cry' || kind === 'happy') cribShot(ctx, t, kind);
  else if (kind === 'mom') hugMom(ctx, t);
  else hugMemory(ctx, t, +kind[1]);
  overlay(ctx, '#fffaf0', 0.7 * (1 - clamp((t - CHORUS[k][0]) / 0.25))); // 每次切换闪一下白
  overlay(ctx, '#1a1b3a', ss(160.2, 161.0, t));
}

// ---------- 间奏：坐纸船渡过星河 ----------
const LANTERNS = (() => { const r = rng(171); return Array.from({ length: 12 }, () => ({ x: r() * W * 2.4, y: 720 + r() * 260, s: 18 + r() * 14, ph: r() * TAU })); })();
function shotRiver(ctx, t, E) {
  const lt = t - 161;
  vbg(ctx, '#151a3d', '#3a3466');
  const twinkle = 0.75 + 0.35 * E.e; // 星星随音乐音量闪烁
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.4, s * twinkle, r + lt * 0.1);
  const r = rng(5);
  for (let i = 0; i < 60; i++) { const u = r(); const x = u * W, y = 80 + u * 380 + (r() - 0.5) * 120; sheet(ctx, P.circle(x, y, 3 + r() * 6), ['#f6e7c8', '#c9c6ef', '#f3d27a'][i % 3], { shadow: false, edgeW: 0.8 }); }
  const wp = ss(170, 184, t);
  if (wp > 0 && wp < 1) K.whale(ctx, lerp(W + 400, -400, wp), 330 + Math.sin(lt * 0.7) * 30, 200, t);
  const scroll = lt * 80;
  for (let i = 0; i < 4; i++) tornRidge(ctx, x => 700 + i * 70 + Math.sin((x + scroll * (0.5 + i * 0.3)) / 160 + i) * 14, ['#2d3a78', '#283368', '#222c5a', '#1c244c'][i], 70 + i, { rough: 3, blur: 8, shadowA: 0.25 });
  for (const L of LANTERNS) {
    const x = ((L.x - scroll * 0.9) % (W * 2.4) + W * 2.4) % (W * 2.4) - 200;
    ctx.save(); ctx.globalAlpha = 0.35; sheet(ctx, P.circle(x, L.y + Math.sin(t + L.ph) * 6, L.s * 2.4), '#f6c46f', { shadow: false, edge: false }); ctx.restore();
    K.lantern(ctx, x, L.y + Math.sin(t + L.ph) * 6, L.s, t, '#e9844a');
  }
  const bx = 820, by = 760 + Math.sin(t * 1.3) * 8;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(t * 1.4) * 0.05); ctx.translate(-bx, -by);
  K.boat(ctx, bx, by + 10, 230, t, 'sail');
  bundle(ctx, bx - 120, by - 140, 110, t);
  person(ctx, { ...CAST.soul, x: bx, y: by - 20, h: 230, expr: wp > 0.2 && wp < 0.8 ? 'o' : 'smile', blink: blink(t, 2), turn: wp > 0.2 && wp < 0.8 ? -0.4 : 0.4, armR: wp > 0.3 && wp < 0.7 ? 2.6 : 0.4, t });
  K.boat(ctx, bx, by + 10, 230, t, 'hull');
  ctx.restore();
  const shore = easeOut(ss(186, 192.5, t));
  if (shore > 0) {
    ctx.save(); ctx.translate((1 - shore) * 1100, 0);
    sheet(ctx, P.ellipse(1700, 820, 520, 190), '#3f6a5a', { blur: 14 });
    sheet(ctx, P.ellipse(1760, 790, 400, 130), '#4f7a64', { blur: 8, sy: 3 });
    for (let i = 0; i < 12; i++) K.flower(ctx, 1380 + i * 60, 760 + Math.abs(i - 6) * 8, 13, ['#f2a7b4', '#f6e7c8', '#f3d27a', '#c9c6ef'][i % 4], t);
    ctx.restore();
  }
}

// ---------- 遇见故人：年轻的外婆 ----------
function meadow(ctx, t) {
  vbg(ctx, '#1b2148', '#4a4277');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.2, s * 0.9, r);
  sheet(ctx, P.circle(1580, 200, 80), '#f6e7c0', { blur: 24, shadowA: 0.15 });
  tornRidge(ctx, x => 720 + Math.sin(x / 400) * 40, '#2f5a50', 90);
  tornRidge(ctx, x => 820 + Math.sin(x / 300 + 1) * 30, '#3f6a5a', 91);
  const r = rng(93);
  for (let i = 0; i < 26; i++) K.flower(ctx, r() * W, 860 + r() * 200, 12 + r() * 8, ['#f2a7b4', '#f6e7c8', '#f3d27a', '#c9c6ef'][i % 4], t);
}
const GM = { ...CAST.grandma, tie: '#f2a7b4' };
function shotMeet(ctx, t) {
  meadow(ctx, t);
  const kx = lerp(300, 820, easeInOut(ss(193, 196.5, t)));
  const turned = t > 195.4;
  person(ctx, { ...GM, x: 1180, y: 900, h: 560, expr: turned ? 'happy' : 'calm', blink: blink(t, 1), turn: turned ? -0.5 : 0.6, armL: t > 196 ? 2.5 + Math.sin(t * 7) * 0.3 : 0.25, t });
  person(ctx, { ...CAST.soul, x: kx, y: 940, h: 260, expr: t > 196.2 ? 'o' : 'smile', blink: blink(t, 2), turn: 0.5, walk: t * 7, walkAmt: 1 - ss(196.2, 196.8, t), t });
  bundle(ctx, kx - 95, 760, 120, t);
}
function shotPonytail(ctx, t) {
  vbg(ctx, '#2a2f5e', '#5d5590');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.2, s, r);
  for (let i = 0; i < 16; i++) sheet(ctx, P.ellipse(frac(i * 0.137 + (t - 197.6) * 0.12) * W, 200 + (i * 97 % 700), 8, 4.8, t + i), '#f5b8c4', { blur: 2, sy: 1, edgeW: 1 });
  sheet(ctx, c => { c.moveTo(560, H + 40); c.bezierCurveTo(600, 760, 800, 720, 960, 720); c.bezierCurveTo(1120, 720, 1320, 760, 1360, H + 40); c.closePath(); }, GM.coat, { blur: 16 });
  head(ctx, 960, 420, 260, { ...GM, expr: 'smile', blink: blink(t, 1), ponySide: -1, t: t * 1.5, tilt: Math.sin(t * 0.8) * 0.05 });
}
// 露出和你一样的笑：左右分屏，同样的笑脸
function shotSameSmile(ctx, t) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W / 2, H); ctx.clip();
  vbg(ctx, '#2a2f5e', '#5d5590'); for (const [x, y, s, r] of STARS) if (x < W / 2) star(ctx, x, y * 1.2, s, r);
  head(ctx, W * 0.25, 520, 230, { ...GM, expr: 'happy', blink: blink(t, 1), t, tilt: 0.06 });
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(W / 2, 0, W / 2, H); ctx.clip();
  vbg(ctx, '#f6dccb', '#ecbfa8');
  head(ctx, W * 0.75, 520, 230, { ...CAST.mom, expr: 'happy', blink: blink(t, 1), t, tilt: -0.06 });
  ctx.restore();
  const r = rng(2); const pts = []; for (let y = -10; y <= H + 10; y += 20) pts.push([W / 2 + (r() - 0.5) * 16, y]);
  sheet(ctx, c => { pts.forEach(([x, y], i) => i ? c.lineTo(x - 8, y) : c.moveTo(x - 8, y)); pts.slice().reverse().forEach(([x, y]) => c.lineTo(x + 8, y)); c.closePath(); }, '#fbf6ec', { blur: 10 });
  const hp = popIn(t, 203.0, 0.4); if (hp > 0) heart(ctx, W / 2, 220, 40 * hp);
}
// 她讲你成长的故事：翻绘本，每页是你不同年纪的样子
function shotStories(ctx, t) {
  meadow(ctx, t);
  person(ctx, { ...GM, x: 1250, y: 960, h: 520, expr: 'happy', blink: blink(t, 1), turn: -0.5, armL: 1.2, t });
  person(ctx, { ...CAST.soul, x: 600, y: 980, h: 260, expr: 'o', blink: blink(t, 2), turn: 0.5, t });
  const pages = [206.7, 207.9, 209.1, 210.3];
  let page = 0; for (let i = 0; i < pages.length; i++) if (t > pages[i] + 0.3) page = i;
  const flip = Math.max(...pages.map(p => (t > p && t < p + 0.3) ? (t - p) / 0.3 : 0));
  const drawPage = (c, i, x, y) => {
    c.fillStyle = ['#fde9d4', '#e9f2e0', '#e6eef8', '#f8e3ea'][((i % 4) + 4) % 4]; c.fillRect(x - 200, y - 150, 400, 300);
    if (i <= 0) baby(c, x, y + 20, 150, { expr: 'sleep', t });
    else if (i === 1) person(c, { ...YOUSOUL, scarf: null, hairStyle: 'ponytail', coat: '#f2a65a', x, y: y + 120, h: 200, expr: 'laugh', armR: 2.4, t });
    else if (i === 2) person(c, { kind: 'kid', hairStyle: 'long', hair: '#2f2422', coat: '#6f8fb8', pants: '#3d4a66', x, y: y + 130, h: 240, expr: 'happy', t });
    else person(c, { ...CAST.mom, x, y: y + 140, h: 270, expr: 'happy', t });
  };
  const bp = backOut((t - 206.6) / 0.5);
  ctx.save(); ctx.translate(900, 470); ctx.scale(bp, bp); ctx.translate(-900, -470);
  K.book(ctx, 900, 320, 230, 300, page, drawPage, flip);
  ctx.restore();
}
// 星空另一端，思念从未停止：上面是天上的她，下面是窗前的你，虚线把两边连起来
function shotLonging(ctx, t) {
  vbg(ctx, '#1b2148', '#3a3466');
  for (const [x, y, s, r] of STARS) star(ctx, x, y, s * 0.8, r);
  cloud(ctx, 300, 470, 60, '#e9e1f0', 1); cloud(ctx, 1500, 450, 70, '#e9e1f0', 2);
  person(ctx, { ...GM, x: 520, y: 470, h: 330, expr: 'calm', turn: 0.4, blink: blink(t, 1), t });
  sheet(ctx, P.rrect(0, 560, W, 520, 0), '#2f3a66', { blur: 16 });
  K.city(ctx, 1080, r => clamp((t - 211) * 2 - r * 3), t, { back: '#4a4a7a' });
  K.windowFrame(ctx, 1220, 640, 260, 220, '#f9d98a', { frame: '#6a4d66' });
  ctx.save(); ctx.beginPath(); ctx.rect(1220, 640, 260, 220); ctx.clip();
  head(ctx, 1350, 760, 70, { ...CAST.mom, expr: 'calm', blink: blink(t, 2), t, tilt: -0.1 });
  ctx.restore();
  const p = ss(211.6, 213.6, t);
  ctx.save(); ctx.setLineDash([14, 14]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = '#f3d27a'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(620, 230); ctx.quadraticCurveTo(1100, 120, lerp(620, 1350, p), lerp(230, 690, p)); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 3; i++) { const q = frac(t * 0.4 + i / 3); heart(ctx, lerp(640, 1340, q), lerp(240, 680, q) - Math.sin(q * Math.PI) * 200, 14 * p); }
}
// 如同墓碑上的名字：你在她的墓前放一束花，她在云上看着
function shotGrave(ctx, t) {
  vbg(ctx, '#e9a17f', '#f6d5b0');
  sheet(ctx, P.circle(1500, 520, 120), '#fbe0a8', { blur: 24, shadowA: 0.1 });
  tornRidge(ctx, x => 760 + Math.sin(x / 500) * 50, '#8a9a6a', 101);
  tornRidge(ctx, x => 860 + Math.sin(x / 400 + 2) * 20, '#6f8a5a', 102);
  K.tombstone(ctx, 1020, 880, 260);
  for (let i = 0; i < 6; i++) K.flower(ctx, 900 + i * 45, 880, 12, ['#f2a7b4', '#f6e7c8', '#f3d27a'][i % 3], t);
  ctx.save(); ctx.globalAlpha = 0.45 + 0.1 * Math.sin(t * 2); cloud(ctx, 1020, 240, 90, '#fdfaf3', 5); person(ctx, { ...GM, x: 1020, y: 230, h: 200, expr: 'smile', t }); ctx.restore();
  const bow = ss(216, 217, t);
  person(ctx, { ...CAST.mom, x: 640, y: 960, h: 600, expr: 'sad', blink: blink(t, 1), turn: 0.5, lean: bow * 0.8, armR: lerp(1.6, 0.5, bow), t });
}
// 不要哭：半透明的小魂浮在旁边，摸摸你的头
function shotDontCry(ctx, t) {
  vbg(ctx, '#d98a74', '#f0c09c');
  tornRidge(ctx, x => 820 + Math.sin(x / 500) * 30, '#7a8a5a', 103);
  K.tombstone(ctx, 1500, 900, 200);
  head(ctx, 820, 560, 260, { ...CAST.mom, expr: 'cry', t, tilt: 0.08 });
  sheet(ctx, c => { c.moveTo(440, H + 40); c.bezierCurveTo(480, 900, 620, 850, 820, 850); c.bezierCurveTo(1020, 850, 1160, 900, 1200, H + 40); c.closePath(); }, '#efe2cc', { blur: 16 });
  ctx.save(); ctx.globalAlpha = 0.55 + 0.15 * Math.sin(t * 2);
  const fy = 520 + Math.sin(t * 1.5) * 14;
  person(ctx, { ...CAST.soul, x: 1180, y: fy + 140, h: 280, expr: t > 222.6 ? 'smile' : 'sad', blink: blink(t, 3), turn: -0.6, armL: 2.3 + Math.sin(t * 6) * 0.15, t });
  ctx.restore();
  for (let i = 0; i < 4; i++) { const p = frac(t * 0.5 + i / 4); ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.8; star(ctx, 1000 + i * 60, 380 - p * 160, 12, p * 4); ctx.restore(); }
}
// 时空是个圆圈：我直走（穿过圆心），你转弯（沿着圆），最后在顶上相见
function shotCircle(ctx, t) {
  vbg(ctx, '#232856', '#5a4d82');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.8, s * 0.8, r);
  const cx = W / 2, cy = 540, R = 340;
  const draw = easeInOut(ss(224.0, 225.2, t));
  ctx.save(); ctx.strokeStyle = '#f6e7c8'; ctx.lineWidth = 30; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI / 2, Math.PI / 2 + draw * TAU); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; sheet(ctx, P.circle(cx + Math.cos(a) * (R - 50), cy + Math.sin(a) * (R - 50), 8), '#f3d27a', { shadow: false, edgeW: 1 }); }
  ctx.save(); ctx.setLineDash([12, 14]); ctx.strokeStyle = 'rgba(246,231,200,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy + R); ctx.lineTo(cx, cy - R); ctx.stroke(); ctx.restore();
  const p = easeInOut(ss(225.4, 228.8, t));
  const meet = t > 228.8;
  const ky = lerp(cy + R, cy - R, p) + 10;
  const ang = Math.PI / 2 + p * Math.PI;
  const yx = cx + Math.cos(ang) * R, yy = cy + Math.sin(ang) * R + 10;
  if (!meet) {
    person(ctx, { ...CAST.soul, x: cx, y: ky, h: 170, expr: 'calm', blink: blink(t, 1), walk: t * 8, walkAmt: p > 0 && p < 1 ? 1 : 0, t });
    person(ctx, { ...YOUSOUL, x: yx, y: yy, h: 165, expr: 'calm', blink: blink(t, 2), walk: t * 8, walkAmt: p > 0 && p < 1 ? 1 : 0, turn: 0.5, t });
  } else {
    K.hug(ctx, cx, cy - R + 10, { ...CAST.soul, h: 170 }, { ...YOUSOUL, h: 165 }, t);
    const bt = t - 228.8;
    if (bt < 1.5) { const r = rng(4); for (let i = 0; i < 14; i++) { const a = r() * TAU, d = bt * (200 + r() * 200); heart(ctx, cx + Math.cos(a) * d, cy - R - 80 + Math.sin(a) * d, 14 * (1 - bt / 1.5)); } }
  }
}

const SHOTS_C = [
  { a: 138.0, b: 161.0, draw: shotChorus },
  { a: 161.0, b: 193.0, draw: shotRiver },
  { a: 193.0, b: 197.6, draw: shotMeet },
  { a: 197.6, b: 201.4, draw: shotPonytail },
  { a: 201.4, b: 206.6, draw: shotSameSmile },
  { a: 206.6, b: 211.2, draw: shotStories },
  { a: 211.2, b: 215.1, draw: shotLonging },
  { a: 215.1, b: 220.3, draw: shotGrave },
  { a: 220.3, b: 224.0, draw: shotDontCry },
  { a: 224.0, b: 233.6, draw: shotCircle },
];
module.exports = { SHOTS_C, GM, meadow };
