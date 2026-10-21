// 新建一个纸艺 MV 项目：node <skill>/scripts/init_project.js <项目目录> [--example wojide]
// 会做：复制引擎 → 建 assets/ out/ → 放入起步分镜（或示例分镜）→ 安装 @napi-rs/canvas → 检查 ffmpeg 与字体
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = path.resolve(process.argv[2] || 'mv-project');
const exIdx = process.argv.indexOf('--example');
const example = exIdx > 0 ? process.argv[exIdx + 1] : null;
const SKILL = path.resolve(__dirname, '..');

fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
fs.mkdirSync(path.join(dir, 'out'), { recursive: true });
fs.cpSync(path.join(__dirname, 'engine'), path.join(dir, 'engine'), { recursive: true });

if (example) {
  const src = path.join(SKILL, 'examples', example);
  for (const f of fs.readdirSync(src)) if (f.endsWith('.js')) fs.copyFileSync(path.join(src, f), path.join(dir, f));
  console.log(`已放入示例分镜：${example}`);
} else if (!fs.existsSync(path.join(dir, 'shots.js'))) {
  fs.copyFileSync(path.join(__dirname, 'template', 'shots.js'), path.join(dir, 'shots.js'));
  console.log('已放入起步分镜 shots.js');
}

const pkg = path.join(dir, 'package.json');
if (!fs.existsSync(pkg)) fs.writeFileSync(pkg, JSON.stringify({ name: 'paper-mv', private: true, scripts: { stills: 'node engine/mv.js --stills', render: 'node engine/mv.js' } }, null, 2));
console.log('安装 @napi-rs/canvas …');
const r = spawnSync('npm install @napi-rs/canvas --silent', { cwd: dir, stdio: 'inherit', shell: true });
if (r.status !== 0) console.log('⚠ npm 安装失败，请在项目目录手动运行：npm install @napi-rs/canvas');

const ff = spawnSync('ffmpeg', ['-version']);
console.log(ff.status === 0 ? '✓ ffmpeg 可用' : '⚠ 找不到 ffmpeg：请先安装并加入 PATH（见 references/setup.md）');
try {
  const { registerFonts } = require(path.join(dir, 'engine', 'fonts.js'));
  console.log('✓ 字体：' + registerFonts(dir));
} catch (e) { console.log('⚠ ' + e.message); }
console.log(`\n项目已就绪：${dir}\n下一步：把音乐放到 assets/song.mp3、歌词放到 assets/song.lrc，然后在项目目录运行\n  node engine/mv.js --sheet 2,10,20 --out out/sheet.png`);
