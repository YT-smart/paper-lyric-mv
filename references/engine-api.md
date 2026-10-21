# 引擎 API 速查

项目结构：
```
my-mv/
  engine/        ← 引擎（init_project.js 复制进来，一般不用改）
  assets/        ← song.mp3 + song.lrc（+ 可选 font.ttf）
  shots.js       ← 必须有：导出 { SHOTS, HIGHLIGHT, LYRIC_STYLE? }
  story_*.js     ← 你写的各段镜头（可选，按需拆分）
  out/
```
在镜头文件里引入：
```js
const { clamp, lerp, ss, easeInOut, easeOut, frac, win, rng } = require('./engine/lib');
const { W, H, TAU, sheet, P, cloud, tornRidge, person, baby, head, face, lyricChips } = require('./engine/paper');
const { blink, backOut, popIn, jujube, coin, letter, bundle, scissors, bolt, chip, heart } = require('./engine/props');
const { vbg, overlay, camera, star, STARS, river, water, bubbles, kelp, KELP, fish, rings } = require('./engine/stage');
const K = require('./engine/kit'); // K.memoryLook, K.hug, K.house, ...
```
画布固定 1920×1080（`W`、`H`），原点在左上角，y 轴向下。

## 渲染命令（在项目目录里运行）

| 命令 | 作用 |
|---|---|
| `node engine/mv.js --stills 12,30.5 --out out/stills` | 导出指定秒数的静帧 png |
| `node engine/mv.js --sheet 5,10,15,20 --out out/sheet.png` | 静帧拼成总览图（每行 4 张） |
| `node engine/mv.js --from 27 --to 60 --out out/样片.mp4` | 渲染一段（带对应的音乐） |
| `node engine/mv.js --out out/完整版.mp4` | 整首歌 |
| 附加参数 | `--fps 24`、`--preset veryfast`、`--crf 18` |

## shots.js

```js
const SHOTS = [
  { a: 0, b: 9.7, draw: shotTitle },              // a、b 是绝对秒数，按顺序排列
  { a: 9.7, b: 20.2, draw: shotPacking, noLyrics: true },
];
const HIGHLIGHT = { 28.36: '重', 31.14: '底' };    // 键 = LRC 里该句的开始时间
const LYRIC_STYLE = { size: 46, y: 950 };         // 可选
module.exports = { SHOTS, HIGHLIGHT, LYRIC_STYLE };
```
- `draw(ctx, t, E)`：`t` 是整首歌的绝对时间；镜头切换前后 0.12 秒会两个镜头都画（用来溶解），所以 `t` 可能稍微超出 [a,b]，代码要能处理。
- `E`：`{ meta: {ti, ar, ...}, lyrics, credits: [{t,end,text}], e: 当前音量0~1, duration: 歌曲总长 }`。
- 好习惯：所有动画都写成 `t` 的纯函数（用 `ss` 计算进度），不要在函数外存“上一帧”的状态。缓存静态图片可以（参考 `story_d.js` 的 `polaroids()`）。

## lib.js

| 函数 | 说明 |
|---|---|
| `ss(a, b, x)` | 平滑阶跃：x≤a 时为 0，x≥b 时为 1，中间平滑过渡。动画的主力 |
| `win(t, a, b, c, d)` | a→b 淡入，c→d 淡出 |
| `lerp(a, b, k)`、`clamp(x, lo, hi)`、`frac(x)` | 插值、限幅、取小数部分（用来做循环） |
| `easeInOut(k)`、`easeOut(k)` | 缓动 |
| `rng(seed)` | 返回一个可复现的随机函数。粒子位置、树的形状都用它 |
| `parseLrc(file)`、`audioEnergy(mp3, fps)` | 引擎内部使用 |

## paper.js

**`sheet(ctx, path, fill, o)`**：画一张纸片。`path` 是一个往 ctx 里画路径的函数，常用的现成路径在 `P` 里：
- `P.circle(x,y,r)`、`P.ellipse(x,y,rx,ry,rot)`、`P.rrect(x,y,w,h,圆角)`、`P.poly([[x,y],...])`
- 也可以自己写：`c => { c.moveTo(...); c.quadraticCurveTo(...); c.closePath(); }`
- 参数 `o`：`shadow:false` 不要投影；`blur` 投影模糊（默认 10）；`sx`、`sy` 投影偏移；`shadowA` 投影浓度；`edge:false` 不要白边；`edgeW` 白边粗细；`edgeC` 白边颜色

**`tornRidge(ctx, x => y, fill, seed, o)`**：从 y(x) 到画面底部填满，带撕纸毛边。`o.rough` 控制毛边大小。

**`cloud(ctx, x, y, s, fill, seed)`**：纸云。

**`person(ctx, o)`**：画一个全身角色，返回 `{ head:[cx,cy,R], handL:[x,y], handR:[x,y], shY }`。

| 参数 | 含义 |
|---|---|
| `x, y, h` | 脚底位置和身高（必填） |
| `kind` | `'kid'`（大头 Q 版）或 `'adult'` |
| `hairStyle` | `'boy'`（短发，头顶有小芽，`sprout:false` 可去掉）、`'long'`、`'bob'`、`'ponytail'`（`ponySide: ±1` 决定马尾在哪边，`tie` 是发绳颜色）、`'none'` |
| `hair, coat, pants, shoe, skin, sleeve` | 颜色 |
| `dress: true` | 长裙（大人，不画腿） |
| `scarf` | 围巾颜色 |
| `hat` | `'cap'`（`hatColor`、`hatColor2`）、`'army'`、`'doctor'`；`mask: true` 戴口罩 |
| `belt`、`belly: true`、`buttons: false` | 腰带颜色、孕肚、不画纽扣 |
| `expr` | `smile` 微笑、`happy` 眯眼笑、`laugh` 张嘴笑、`o` 惊讶、`sad` 难过、`cry` 哭、`worry` 担心、`calm` 平静、`sleep` 睡着 |
| `blink` | 0–1，用 `blink(t, seed)` |
| `turn` | -1 到 1，脸朝左或朝右 |
| `armL, armR` | 手臂角度：0 下垂，1.2 平举，2.6 举高 |
| `walk, walkAmt` | 走路相位（`t*7`）和幅度（0–1） |
| `hop` | 整体往上跳的像素 |
| `lean` | 身体前倾 |
| `alpha` | 透明度（画灵魂、幽灵） |
| `t` | 传进来，让马尾、小芽跟着飘 |

**`head(ctx, cx, cy, R, o)`**：特写用的大头。参数同上（发型、表情、帽子），另有 `tilt`（歪头，弧度）。

**`baby(ctx, x, y, s, o)`**：襁褓里的婴儿（头朝左）。`o`：`expr`、`blink`、`rot`、`hand: true`（画一只小手）、`wrap`/`fold`（被子颜色）。

**`face(ctx, cx, cy, R, o)`**：只画五官（给自定义形状的角色用）。

**`lyricChips(ctx, text, t, t0, t1, o)`**：纸片字。引擎自动用它画歌词，你也可以用它做片尾的制作人员名单或其他字。

## props.js

| 函数 | 说明 |
|---|---|
| `blink(t, seed, period=3.4)` | 眨眼值 |
| `popIn(t, t0, d=0.35)` | t0 时刻开始弹出，返回 0→1（带回弹）；配合 `ctx.scale(p,p)` |
| `chip(ctx, '？', x, y, s, rot, fill, color)` | 圆形纸片里放一个字或符号 |
| `heart(ctx, x, y, s, fill)` | 爱心 |
| `bundle(ctx, x, y, s, t, {rot, items:false, color})` | 包袱（上面会冒出小物件） |
| `jujube`、`coin(…, spin)`、`letter(…, rot)` | 枣、铜钱（会翻转）、信封 |
| `scissors(ctx, x, y, s, open, rot)` | 剪刀，`open` 是张开的角度 |
| `bolt(ctx, x, y, s, seed)` | 纸片闪电 |

## stage.js

| 函数 | 说明 |
|---|---|
| `vbg(ctx, 上色, 下色)` | 竖直渐变背景 |
| `overlay(ctx, color, a)` | 整屏蒙色（闪白、压暗、淡出） |
| `camera(ctx, cx, cy, z)` | 以 (cx,cy) 为中心放大 z 倍；用 `ctx.save()`/`restore()` 包起来 |
| `star(ctx, x, y, s, rot)`、`STARS` | 五角星；一组固定位置的星星 `[x,y,大小,旋转]` |
| `river(ctx, t, baseY, [颜色…])` | 流动的河面 |
| `water(ctx, t, depth)`、`bubbles(ctx, t)`、`kelp(ctx, KELP[i], baseY, t)`、`fish(…)` | 水下场景 |
| `rings(ctx, cx, cy, t, t0, speed, alpha)` | 纸环隧道 |

## kit.js（`K.`）

| 函数 | 说明 |
|---|---|
| `memoryLook(ctx, a)` | 回忆滤镜：泛黄 + 照片白边，放在镜头最后调用 |
| `hug(ctx, x, y, A, B, t, {hearts:false})` | 两个角色相拥（A、B 是角色参数对象，要带 `h`） |
| `house(ctx, x, baseY, w, h, 墙色, 瓦色, {door, lit})`、`lantern(ctx, x, y, s, t)` | 老房子、灯笼 |
| `windowFrame(ctx, x, y, w, h, 颜色或画窗外的函数, {frame})` | 窗户 |
| `crib(ctx, x, y, w, t, front)`、`mobile(ctx, x, y, t)` | 婴儿床（先画 front=false，再画婴儿，最后画 front=true）、床铃 |
| `book(ctx, x, y, w, h, page, drawPage, flip)` | 打开的绘本，`drawPage(ctx, i, cx, cy)` 画每一页 |
| `tombstone`、`flower(ctx, x, y, s, color, t)` | 墓碑、小花 |
| `train(ctx, x, baseY, s, t)` | 蒸汽火车 |
| `boat(ctx, x, y, s, t, 'sail'|'hull'|'all')` | 纸船（帆和船身可以分开画） |
| `whale(ctx, x, y, s, t)` | 纸鲸鱼 |
| `city(ctx, baseY, r => 亮度, t, {back})`、`CITY` | 城市楼群（窗灯可以逐个亮起）；`CITY` 里有每栋楼的数据 |
| `thought(ctx, x, y, w, h, fromX, fromY, a, drawIn)` | 思考气泡 |

## 写新道具

照着 props.js 的写法来：用 `sheet()` 组合几个形状，深色细节（眼睛、方孔、线条）直接用 `ctx.fill()`/`stroke()` 画。尺寸都乘一个参数 `s`，这样能随意缩放。
