// 通用工具：数学、随机、发光贴图、歌词解析、音频能量
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { createCanvas } = require('@napi-rs/canvas');

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
// 平滑阶跃：x 从 a 到 b 时，返回值从 0 平滑过渡到 1。几乎所有动画都靠它
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const frac = x => x - Math.floor(x);
// 进入 / 退出窗口：a 到 b 淡入，c 到 d 淡出
const win = (t, a, b, c, d) => ss(a, b, t) * (1 - ss(c, d, t));

// 可复现的伪随机数（同一个 seed 每帧结果相同，画面不会抖）
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (c1, c2, t) => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];

// 发光贴图缓存（按颜色）
const spriteCache = new Map();
function glowSprite(c) {
  const key = c.map(v => v | 0).join(',');
  let s = spriteCache.get(key);
  if (s) return s;
  s = createCanvas(256, 256);
  const g = s.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, rgba(c, 1));
  gr.addColorStop(0.12, rgba(c, 0.75));
  gr.addColorStop(0.3, rgba(c, 0.28));
  gr.addColorStop(0.6, rgba(c, 0.07));
  gr.addColorStop(1, rgba(c, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  spriteCache.set(key, s);
  return s;
}
function glow(ctx, x, y, r, c, a = 1) {
  if (a <= 0.002 || r <= 0.5) return;
  ctx.globalAlpha = clamp(a);
  ctx.drawImage(glowSprite(c), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

// LRC 解析：返回 {meta, lyrics:[{t, end, text}], credits}
// 歌词正文与“作词：xx / 编曲：xx”这类制作人员行分开；第一行（通常是“歌名 - 歌手”）不当作歌词
function parseLrc(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const meta = {};
  const all = [];
  for (const line of raw.split(/\r?\n/)) {
    // 一行可能带多个时间戳：[00:12.34][01:20.00]歌词
    const stamps = [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (stamps.length) {
      const text = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim();
      for (const m of stamps) all.push({ t: +m[1] * 60 + +m[2], text });
      continue;
    }
    const mm = line.match(/^\[(\w+):(.*)\]$/);
    if (mm) meta[mm[1]] = mm[2].trim();
  }
  // [offset:+300] 表示歌词整体提前 300 毫秒（LRC 标准：正数=提前）
  const off = (+meta.offset || 0) / 1000;
  if (off) for (const l of all) l.t = Math.max(0, l.t - off);
  all.sort((a, b) => a.t - b.t);
  for (let i = 0; i < all.length; i++) all[i].end = i + 1 < all.length ? all[i + 1].t : all[i].t + 5;
  const isCredit = s => /[：:]/.test(s);
  const isTitle = (l, i) => i === 0 && l.t < 1 && / - /.test(l.text);
  const lyrics = all.filter((l, i) => l.text && !isCredit(l.text) && !isTitle(l, i));
  const credits = all.filter(l => l.text && isCredit(l.text) && l.t > 60);
  return { meta, lyrics, credits };
}

// 音频能量：每帧 RMS，归一化并做起落平滑；结果缓存成 json
// 返回数组，每帧 [包络, 瞬时起伏, 慢速平均]，都在 0~1 左右
function audioEnergy(mp3, fps) {
  const cache = path.join(path.dirname(mp3), `energy_${fps}.json`);
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8'));
  const sr = 22050;
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', mp3, '-ac', '1', '-ar', String(sr), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (!r.stdout || !r.stdout.length) throw new Error('ffmpeg 读取音频失败，确认已安装 ffmpeg 且在 PATH 里');
  const pcm = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
  const hop = sr / fps;
  const n = Math.floor(pcm.length / hop);
  const rms = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0; const a = Math.floor(i * hop), b = Math.floor((i + 1) * hop);
    for (let j = a; j < b; j++) s += pcm[j] * pcm[j];
    rms[i] = Math.sqrt(s / (b - a));
  }
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const p95 = sorted[Math.floor(n * 0.95)] || 1;
  const out = new Array(n);
  let env = 0, slow = 0;
  for (let i = 0; i < n; i++) {
    const v = clamp(rms[i] / p95, 0, 1.3);
    env = v > env ? lerp(env, v, 0.6) : lerp(env, v, 0.12);
    slow = lerp(slow, v, 0.03);
    out[i] = [+env.toFixed(4), +clamp(env - slow, 0, 1).toFixed(4), +slow.toFixed(4)];
  }
  fs.writeFileSync(cache, JSON.stringify(out));
  return out;
}

module.exports = { clamp, lerp, ss, easeOut, easeInOut, frac, win, rng, rgba, mix, glow, glowSprite, parseLrc, audioEnergy };
