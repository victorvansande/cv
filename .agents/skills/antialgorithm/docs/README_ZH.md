<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="橙色钟形曲线，尾部远处有一个点">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | 简体中文 | <a href="README_JA.md">日本語</a> | <a href="README_KO.md">한국어</a> | <a href="README_ES.md">Español</a> | <a href="README_PT.md">Português</a> | <a href="README_DE.md">Deutsch</a> | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![上面是不用技能的六张海报，下面是用了技能的六张](../images/showcase.png)

面向创意工作的智能体技能：名字、故事、游戏点子、海报、界面。它让模型先说出自己第一个、最平均的选择，再根据从项目里找到的理由离开这个选择。

两行海报来自同一个提示词：`Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` 上面一行是不加技能时一次跑出的六张，一张没删。下面一行是在技能还在编写时，从大约十二次运行里挑出来的。

![一个选择被选中频率的图表：平均值附近有一个高峰，标为安全区，两侧平坦](../images/graph.png)

## 安装

[skills](https://github.com/vercel-labs/skills) 命令行工具会把它放到你的智能体读取技能的位置，支持 Codex、Cursor、OpenCode、Claude Code 等：

```
npx skills add mankidev/antialgorithm
```

或者把它克隆到你的智能体的 skills 文件夹：

```
git clone https://github.com/mankidev/antialgorithm <skills 文件夹>/antialgorithm
```

在 Claude Code 中也可以作为插件安装（2.1.275 之前的版本请先运行 `/plugin marketplace add mankidev/antialgorithm`）：

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

脚本需要 Python 3。`check.py` 还需要 numpy、Pillow 和 `rsvg-convert`（或 cairosvg 包）。

## 脚本

`seed.py` 在请求信息太少时掷出一个起点。视觉种子给出制作方法、配色、版式、字体、用于构思的一个动词和一个尺度、一个场景、一个地区，有一半的概率还会给出一个物件。文字种子给出一种口吻、一个切入角度和一种语域。点子种子给出一个动词、一个限制、一个尺度和一种压力。它取自系统随机源，所以两个人发送同一个提示词也会从不同的地方开始。它还会把每个种子保存到 `~/.local/state/antialgorithm/history.jsonl`（设置了 `$XDG_STATE_HOME` 时保存在其下），并跳过最近几次用过的值，所以你自己的种子不会在不同会话之间重复。插件更新不会动这个文件。`--keep "axis=value"` 可以固定某个轴，保留主题，只重新掷外观。

`moves.py` 为每个避开默认选择的回答记下它的主要手法，例如 "neon tube wall, almost no type"。模型在展示新作品前会先读它，这样就不会仅仅因为某个手法上次奏效就再用一次。

`rough.py` 读取一个 SVG，抖动其中的直线、形状和文字，并打乱重复标记的均匀间距，让用代码画出的手工感不再像绘图仪画的。它只用于印刷、绘画、印章、墨水这类手工方法；屏幕、相机和渲染风格保留它们自己的痕迹。

`check.py` 以原尺寸和图标尺寸渲染 SVG，列出超出边缘、被形状遮住、对比度太低或太小的文字。尺寸下限是按海报设定的；检查应用界面时请用 `--min-text 0.6`。

视觉规则在 `visuals.md` 里，模型只在做视觉工作时才读取，所以起名字或写标语时不会加载这些规则。

## 许可证

MIT

## Star 历史

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
