<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="꼬리 끝에 점 하나가 있는 주황색 종 모양 곡선">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | <a href="README_ZH.md">简体中文</a> | <a href="README_JA.md">日本語</a> | 한국어 | <a href="README_ES.md">Español</a> | <a href="README_PT.md">Português</a> | <a href="README_DE.md">Deutsch</a> | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![위는 스킬 없이 만든 포스터 여섯 장, 아래는 스킬을 쓴 여섯 장](../images/showcase.png)

창작 작업을 위한 에이전트 스킬: 이름, 이야기, 게임 아이디어, 포스터, UI. 모델이 처음 떠올린 가장 평균적인 선택을 먼저 말하게 하고, 프로젝트에서 가져온 이유를 들어 그 선택에서 벗어나게 합니다.

두 줄 모두 같은 프롬프트에서 나왔습니다: `Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` 윗줄은 스킬 없이 한 번에 돌린 여섯 개로, 하나도 빼지 않았습니다. 아랫줄은 스킬을 아직 쓰는 중에 돌린 열두 번 정도의 결과에서 골랐습니다.

![어떤 선택이 얼마나 자주 선택되는지 보여 주는 그래프: 평균 근처에 안전 지대라고 표시된 높은 봉우리가 있고 양옆은 평평함](../images/graph.png)

## 설치

[skills](https://github.com/vercel-labs/skills) CLI가 Codex, Cursor, OpenCode, Claude Code 등 에이전트가 스킬을 읽는 위치에 넣어 줍니다:

```
npx skills add mankidev/antialgorithm
```

또는 에이전트의 skills 폴더에 클론하세요:

```
git clone https://github.com/mankidev/antialgorithm <skills 폴더>/antialgorithm
```

Claude Code에서는 플러그인으로도 설치됩니다 (2.1.275 이전 버전에서는 먼저 `/plugin marketplace add mankidev/antialgorithm`을 실행하세요):

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

스크립트에는 Python 3이 필요합니다. `check.py`에는 numpy, Pillow, `rsvg-convert`(또는 cairosvg 패키지)도 필요합니다.

## 스크립트

`seed.py`는 요청에 정보가 적을 때 출발점을 굴려서 정합니다. 시각 시드는 제작 방식, 색, 레이아웃, 글꼴, 아이디어를 위한 동사와 규모, 배경, 지역, 그리고 두 번에 한 번은 사물 하나를 줍니다. 텍스트 시드는 목소리, 들어가는 방식, 말투를 줍니다. 아이디어 시드는 동사, 제약, 규모, 압박을 줍니다. 시스템 난수를 쓰기 때문에 같은 프롬프트를 보낸 두 사람도 서로 다른 곳에서 시작합니다. 시드마다 `~/.local/state/antialgorithm/history.jsonl`(`$XDG_STATE_HOME`이 설정되어 있으면 그 아래)에 저장하고 최근 몇 번의 값은 건너뛰어서, 내 시드가 세션마다 반복되지 않습니다. 플러그인을 업데이트해도 이 파일은 그대로입니다. `--keep "axis=value"`로 축 하나를 고정하면 주제는 두고 겉모습만 다시 굴릴 수 있습니다.

`moves.py`는 기본값을 피한 답마다 그 중심이 된 수를 짧게 기록합니다. 예: "neon tube wall, almost no type". 모델은 새 작업을 보여 주기 전에 이 기록을 읽기 때문에, 지난번에 통했다는 이유만으로 같은 수를 다시 쓰지 않습니다.

`rough.py`는 SVG의 직선, 도형, 글자를 흔들고 반복되는 표시의 고른 간격을 깨서, 코드로 그린 손맛이 플로터로 그린 것처럼 보이지 않게 합니다. 인쇄, 물감, 도장, 잉크처럼 손으로 만드는 방식에만 씁니다. 화면, 카메라, 렌더 느낌은 각자의 흔적을 그대로 둡니다.

`check.py`는 SVG를 원래 크기와 아이콘 크기로 렌더링하고, 가장자리 밖으로 나간 글자, 도형 아래 깔린 글자, 대비가 낮거나 너무 작은 글자를 알려 줍니다. 크기 기준은 포스터에 맞춰져 있으니 앱 화면에는 `--min-text 0.6`을 쓰세요.

시각 규칙은 `visuals.md`에 있고, 모델은 시각 작업을 할 때만 이 파일을 읽습니다. 그래서 이름이나 슬로건을 지을 때는 불러오지 않습니다.

## 라이선스

MIT

## 스타 기록

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
