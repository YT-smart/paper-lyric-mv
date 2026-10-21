// 分镜表（起步模板）。把它改成你这首歌的故事：每个镜头 {a 开始秒, b 结束秒, draw(ctx, t, E)}
// t 是整首歌的绝对时间（秒），所以动画时间点可以直接对照 LRC 里的歌词时间写。
// 歌词纸片由引擎自动叠加（读 assets/song.lrc），镜头里不用、也不要手写歌词文字。
const { clamp, lerp, ss, easeInOut, frac } = require('./engine/lib');
const { W, H, sheet, P, cloud, tornRidge, person, baby, head } = require('./engine/paper');
const { blink, popIn, heart, chip } = require('./engine/props');
const { vbg, overlay, camera, star, STARS } = require('./engine/stage');
const K = require('./engine/kit');

// 角色表：全片固定一套，每个角色的配色、发型不要中途变，观众靠这些认人
const CAST = {
  me: { kind: 'kid', hairStyle: 'boy', hair: '#3b2c28', coat: '#e7ad55', pants: '#5b4a3e' },
  you: { kind: 'kid', hairStyle: 'ponytail', hair: '#33241f', coat: '#d6554a', pants: '#4b3b52', ponySide: 1 },
};

// 镜头 1：片名
function shotTitle(ctx, t, E) {
  vbg(ctx, '#27345a', '#6a5584');
  for (const [x, y, s, r] of STARS) star(ctx, x, y * 1.6, s, r);
  cloud(ctx, 420, 760, 90, '#f7f1e6', 1); cloud(ctx, 1500, 700, 110, '#f7f1e6', 2);
  const title = [...(E.meta.ti || '歌名')];
  title.forEach((ch, i) => {
    const p = popIn(t, 1 + i * 0.3, 0.5);
    if (p <= 0) return;
    ctx.save(); ctx.translate(W / 2 + (i - (title.length - 1) / 2) * 190, 440); ctx.rotate((i % 2 ? 1 : -1) * 0.05); ctx.scale(p, p);
    sheet(ctx, P.rrect(-80, -80, 160, 160, 10), '#fbf6ec', { blur: 14, sy: 7 });
    ctx.fillStyle = '#3a2c26'; ctx.font = '120px Kai'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 6);
    ctx.restore();
  });
  overlay(ctx, '#000', 1 - ss(0, 1.2, t));
}

// 镜头 2：两个角色在草地上相遇（演示走路、表情变化、弹出爱心）
function shotMeet(ctx, t) {
  vbg(ctx, '#bfe0ee', '#f6e6c8');
  cloud(ctx, 400, 200, 70, '#fdfaf3', 3);
  tornRidge(ctx, x => 760 + Math.sin(x / 300) * 30, '#9fc18a', 7);
  tornRidge(ctx, x => 860 + Math.sin(x / 260 + 2) * 20, '#7faa6c', 8);
  const t0 = 8; // 这个镜头开始的时间
  const walk = ss(t0, t0 + 3, t);
  const meet = t > t0 + 3;
  person(ctx, { ...CAST.me, x: lerp(300, 840, walk), y: 940, h: 280, expr: meet ? 'happy' : 'smile', blink: blink(t, 1), turn: 0.5, walk: t * 8, walkAmt: meet ? 0 : 1, t });
  person(ctx, { ...CAST.you, x: lerp(1620, 1080, walk), y: 940, h: 270, expr: meet ? 'laugh' : 'smile', blink: blink(t, 2), turn: -0.5, walk: t * 8, walkAmt: meet ? 0 : 1, armL: meet ? 2.4 : 0.3, t });
  if (meet) heart(ctx, 960, 560 - (t - t0 - 3) * 20, 34 * popIn(t, t0 + 3.2));
}

const SHOTS = [
  { a: 0, b: 8, draw: shotTitle },
  { a: 8, b: 9999, draw: shotMeet },
];
// 每句歌词里用红色纸片强调的字：键是该句在 LRC 里的开始时间（秒）
const HIGHLIGHT = {};
module.exports = { SHOTS, HIGHLIGHT, CAST };
