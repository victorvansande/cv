<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="尾の先に点がひとつあるオレンジの釣鐘曲線">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | <a href="README_ZH.md">简体中文</a> | 日本語 | <a href="README_KO.md">한국어</a> | <a href="README_ES.md">Español</a> | <a href="README_PT.md">Português</a> | <a href="README_DE.md">Deutsch</a> | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![上はスキルなしのポスター6枚、下はスキルありの6枚](../images/showcase.png)

クリエイティブな作業のためのエージェントスキルです。対象は名前、ストーリー、ゲームのアイデア、ポスター、UI。モデルに最初に浮かんだいちばん平均的な案をまず言わせ、プロジェクトから取った理由をもとにその案から離れさせます。

2段とも同じプロンプトから作りました：`Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` 上の段はスキルなしで6回実行したもので、1枚も外していません。下の段は、スキルを書いている途中に実行した十数回の中から選んだものです。

![ある選択が選ばれる頻度のグラフ：平均のまわりに安全地帯と書かれた高い山があり、両側は平ら](../images/graph.png)

## インストール

[skills](https://github.com/vercel-labs/skills) CLI を使うと、Codex、Cursor、OpenCode、Claude Code などのエージェントがスキルを読み込む場所に入ります：

```
npx skills add mankidev/antialgorithm
```

または、エージェントの skills フォルダにクローンします：

```
git clone https://github.com/mankidev/antialgorithm <skills フォルダ>/antialgorithm
```

Claude Code ではプラグインとしても入れられます（2.1.275 より前のバージョンでは、先に `/plugin marketplace add mankidev/antialgorithm` を実行してください）：

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

スクリプトには Python 3 が必要です。`check.py` にはさらに numpy、Pillow、`rsvg-convert`（または cairosvg パッケージ）が必要です。

## スクリプト

`seed.py` は、依頼の情報が少ないときに出発点をサイコロで決めます。ビジュアル用のシードは、制作手法、配色、レイアウト、書体、アイデアのための動詞とスケール、舞台、地域、そして2回に1回は物をひとつ出します。テキスト用のシードは、語りの声、入り方、文体を出します。アイデア用のシードは、動詞、制約、スケール、プレッシャーを出します。システムの乱数を使うので、同じプロンプトを送った2人でも出発点が変わります。各シードは `~/.local/state/antialgorithm/history.jsonl`（`$XDG_STATE_HOME` が設定されていればその下）に保存され、直近のいくつかで出た値は避けるので、自分のシードがセッションをまたいで繰り返されることもありません。プラグインを更新してもこのファイルは残ります。`--keep "axis=value"` で軸をひとつ固定でき、題材はそのままに見た目だけを振り直せます。

`moves.py` は、デフォルトを避けた回答ごとに、その中心になった手を短く記録します。たとえば "neon tube wall, almost no type" のようにです。モデルは新しい作品を見せる前にこれを読むので、前回うまくいったというだけで同じ手を使い回すことがなくなります。

`rough.py` は SVG の直線、図形、文字を揺らし、繰り返し模様の等間隔を崩して、コードで描いた手作り風の絵がプロッターで描いたように見えないようにします。印刷、絵の具、スタンプ、インクのような手作業の手法専用です。画面、カメラ、レンダーの見た目はそれぞれの痕跡をそのまま残します。

`check.py` は SVG を原寸とアイコンサイズでレンダリングし、端からはみ出した文字、図形の下に隠れた文字、コントラストが低い文字、小さすぎる文字を一覧にします。サイズの下限はポスター向けです。アプリ画面には `--min-text 0.6` を使ってください。

ビジュアルのルールは `visuals.md` にあり、モデルはビジュアルの作業のときだけ読みます。名前やスローガンを考えるときには読み込まれません。

## ライセンス

MIT

## スター履歴

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
