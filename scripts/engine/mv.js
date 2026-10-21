// 纸艺歌词 MV 渲染器。在项目根目录运行（根目录里要有 shots.js 和 assets/）
//   node engine/mv.js --stills 30,35.5,47 --out out/stills    导出静帧（检查画面用）
//   node engine/mv.js --sheet 10,20,30,40 --out out/sheet.png  多张静帧拼成一张总览图
//   node engine/mv.js --from 27 --to 60 --out out/样片.mp4      渲染片段（带音乐）
//   node engine/mv.js --out out/完整版.mp4                      渲染完整版
// 其他参数：--fps 24（默认） --preset veryfast（x264 速度档） --crf 18（画质，越小越清晰）
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { createCanvas } = require('@napi-rs/canvas');
const { ss, clamp, parseLrc, audioEnergy } = require('./lib');
const { W, H, paperTexture, lyricChips } = require('./paper');
const { registerFonts } = require('./fonts');

const ROOT = process.cwd();
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') && a.push([v.slice(2), arr[i + 1]]), a), []));
const FPS = +(args.fps || 24);
const find = (...names) => names.map(n => path.join(ROOT, 'assets', n)).find(f => fs.existsSync(f));
const SONG = find('song.mp3', 'song.m4a', 'song.wav', 'song.flac');
const LRC = find('song.lrc');
if (!SONG || !LRC) { console.error('缺少 assets/song.mp3（或 .m4a/.wav/.flac）或 assets/song.lrc'); process.exit(1); }
registerFonts(ROOT);
const lrc = parseLrc(LRC);
const { SHOTS, HIGHLIGHT = {}, LYRIC_STYLE = {} } = require(path.join(ROOT, 'shots.js'));
const duration = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SONG]).stdout.toString().trim();

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
const buf = createCanvas(W, H), bctx = buf.getContext('2d');
const XF = 0.12; // 镜头之间极短的溶解，避免硬切跳帧

const VIG = (() => {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const gr = g.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.05);
  gr.addColorStop(0, 'rgba(60,30,20,0)'); gr.addColorStop(1, 'rgba(60,30,20,0.28)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); return c;
})();

const energy = audioEnergy(SONG, FPS);
function frame(t) {
  // E：传给每个镜头的公共信息（歌名歌手、制作人员、当前音量能量）
  const E = { meta: lrc.meta, credits: lrc.credits, lyrics: lrc.lyrics, e: energy[clamp(Math.floor(t * FPS), 0, energy.length - 1)][0], duration };
  const i = SHOTS.findIndex(s => t >= s.a && t < s.b);
  const cur = SHOTS[i < 0 ? SHOTS.length - 1 : i];
  ctx.save(); cur.draw(ctx, t, E); ctx.restore();
  const next = SHOTS[i + 1];
  if (next && t > cur.b - XF) {
    bctx.save(); next.draw(bctx, t, E); bctx.restore();
    ctx.globalAlpha = ss(cur.b - XF, cur.b, t); ctx.drawImage(buf, 0, 0); ctx.globalAlpha = 1;
  }
  ctx.drawImage(VIG, 0, 0);
  paperTexture(ctx, 0.85);
  const L = lrc.lyrics.find(l => t >= l.t && t < l.end + 0.15);
  if (L && !(cur.noLyrics)) lyricChips(ctx, L.text, t, L.t, L.end, { highlight: HIGHLIGHT[L.t] ? [...HIGHLIGHT[L.t]] : [], ...LYRIC_STYLE });
}

function stills(times, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const s of times) {
    frame(s);
    const f = path.join(dir, `t${s.toFixed(2).replace('.', '_')}.png`);
    fs.writeFileSync(f, canvas.encodeSync('png')); files.push(f);
  }
  return files;
}

async function main() {
  const out = path.resolve(ROOT, args.out || 'out/mv.mp4');
  if (args.stills) { stills(args.stills.split(',').map(Number), out); console.log('静帧已导出到', out); return; }
  if (args.sheet) {
    // 静帧总览：4 列，每张缩到 480x270
    const times = args.sheet.split(',').map(Number);
    const tmp = path.join(path.dirname(out), '_sheet_tmp');
    fs.rmSync(tmp, { recursive: true, force: true });
    const files = stills(times, tmp);
    files.forEach((f, i) => fs.renameSync(f, path.join(tmp, `${String(i).padStart(3, '0')}.png`)));
    const cols = Math.min(4, files.length), rows = Math.ceil(files.length / cols);
    spawnSync('ffmpeg', ['-y', '-v', 'error', '-start_number', '0', '-i', path.join(tmp, '%03d.png'), '-frames:v', '1', '-vf', `scale=480:270,tile=${cols}x${rows}:padding=3`, out]);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log('总览图：', out); return;
  }
  const from = +(args.from || 0), to = Math.min(+(args.to || duration), duration);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-ss', String(from), '-t', String(to - from), '-i', SONG, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', args.preset || 'veryfast', '-crf', String(args.crf || 18), '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((to - from) * FPS), t0 = Date.now();
  for (let k = 0; k < n; k++) {
    frame(from + k / FPS);
    const px = ctx.getImageData(0, 0, W, H).data;
    if (!ff.stdin.write(Buffer.from(px.buffer, px.byteOffset, px.byteLength))) await new Promise(r => ff.stdin.once('drain', r));
    if (k % 240 === 0) { const el = (Date.now() - t0) / 1000; console.log(`帧 ${k}/${n}  已用 ${el.toFixed(0)}s  预计剩余 ${k ? (el / k * (n - k)).toFixed(0) : '?'}s`); }
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('完成：', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
main();
