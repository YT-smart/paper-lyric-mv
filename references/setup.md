# 环境安装

需要三样东西：**Node.js 18+**、**ffmpeg**（包括 ffprobe，要在 PATH 里），以及**一个中文字体**。先检查：

```bash
node -v
ffmpeg -version
```

## Windows

**有 winget 的话**（Windows 10/11 一般都有）：
```powershell
winget install -e --id OpenJS.NodeJS.LTS
winget install -e --id Gyan.FFmpeg
```
装完要新开一个终端，PATH 才会生效。

**没有 winget**（比如 Windows Server），用官方便携版：
```powershell
$t = "$env:USERPROFILE\tools"; New-Item -ItemType Directory -Force $t | Out-Null
$v = (Invoke-RestMethod https://nodejs.org/dist/index.json | Where-Object { $_.lts } | Select-Object -First 1).version
curl.exe -sL -o "$t\node.zip" "https://nodejs.org/dist/$v/node-$v-win-x64.zip"
curl.exe -sL -o "$t\ffmpeg.zip" https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
Expand-Archive "$t\node.zip" $t -Force; Expand-Archive "$t\ffmpeg.zip" $t -Force; Remove-Item "$t\*.zip"
$node = (Get-ChildItem $t -Directory -Filter "node-*").FullName
$ff = (Get-ChildItem $t -Directory -Filter "ffmpeg-*").FullName + "\bin"
[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path','User') + ";$node;$ff", 'User')
$env:Path += ";$node;$ff"
```
注意：有些代理终端每条命令都开一个新的 shell，不会读到刚改过的用户 PATH。这时要在每条命令前面加上 `$env:Path += ";<node目录>;<ffmpeg\bin目录>"`。

**字体**：Windows 自带楷体（`C:/Windows/Fonts/simkai.ttf`），引擎会自动找到。

**编码提醒**：PowerShell 5.1 的 `Get-Content`/`Set-Content` 默认不按 UTF-8 读写，用它们改 .js 文件会把中文变成乱码。改代码请用编辑工具，或者用 node 读写。

## macOS

```bash
brew install node ffmpeg
```
字体：系统的“楷体”需要先在“字体册”里下载。不想折腾的话，把任意中文字体文件复制到项目的 `assets/font.ttf`（也可以是 .otf/.ttc）。

## Linux

```bash
sudo apt install -y nodejs npm ffmpeg fonts-arphic-ukai   # 楷体
# 或者装 fonts-noto-cjk
```
Node 版本太旧的话，用 nvm 或 NodeSource 装 18 以上的版本。

## 字体怎么选

引擎把字体统一注册成 `Kai`，按这个顺序找：
1. 项目里的 `assets/font.ttf` / `.otf` / `.ttc`
2. 系统楷体（Windows simkai、macOS Kaiti、Linux ukai）
3. 其他系统中文字体（Noto Serif CJK、微软雅黑、苹方）

想换风格（比如手写体、圆体），把字体文件放到 `assets/font.ttf` 就行。用于公开发布的视频要注意字体授权。

## 新建项目

```bash
node <技能目录>/scripts/init_project.js my-mv            # 空白项目（带起步模板）
node <技能目录>/scripts/init_project.js my-mv --example wojide   # 带《我记得》示例分镜
```
脚本最后会报告 ffmpeg 和字体的状态。出现 ⚠ 的话，按上面的方法补装。

## 性能

- 1080p 单帧大约 0.1–0.15 秒（2 核机器），5 分钟的歌在 24fps 下大约 20 分钟渲完。
- 突然慢了十几倍，多半是别的进程占着 CPU 或内存。先查任务管理器或 `top`。
- 想要更快：`--preset ultrafast`（文件会更大）。想要更清晰：`--crf 16`。
