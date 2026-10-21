// 注册中文字体，统一叫 'Kai'（场景代码里都用 `XXpx Kai`）
// 优先级：项目 assets/font.ttf|otf|ttc → 系统楷体 → 其他系统中文字体
const fs = require('fs');
const path = require('path');
const { GlobalFonts } = require('@napi-rs/canvas');

const CANDIDATES = [
  'C:/Windows/Fonts/simkai.ttf',              // Windows 楷体
  'C:/Windows/Fonts/STKAITI.TTF',
  '/System/Library/Fonts/Supplemental/Kaiti.ttc', // macOS（需在“字体册”里下载楷体）
  '/Library/Fonts/Kaiti.ttc',
  '/System/Library/Fonts/Supplemental/Songti.ttc',
  '/usr/share/fonts/truetype/arphic/ukai.ttc', // Linux: fonts-arphic-ukai
  '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc',
  '/usr/share/fonts/noto-cjk/NotoSerifCJK-Regular.ttc',
  'C:/Windows/Fonts/msyh.ttc',                // 实在没有楷体就用微软雅黑
  '/System/Library/Fonts/PingFang.ttc',
];

function registerFonts(root) {
  const own = ['font.ttf', 'font.otf', 'font.ttc'].map(f => path.join(root, 'assets', f));
  for (const f of [...own, ...CANDIDATES]) {
    if (fs.existsSync(f) && GlobalFonts.registerFromPath(f, 'Kai')) return f;
  }
  throw new Error('找不到中文字体：请把任意中文字体文件放到 assets/font.ttf（或 .otf/.ttc）');
}
module.exports = { registerFonts };
