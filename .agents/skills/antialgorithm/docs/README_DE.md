<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="Orange Glockenkurve mit einem Punkt weit draußen am Ende">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | <a href="README_ZH.md">简体中文</a> | <a href="README_JA.md">日本語</a> | <a href="README_KO.md">한국어</a> | <a href="README_ES.md">Español</a> | <a href="README_PT.md">Português</a> | Deutsch | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![Oben sechs Plakate ohne den Skill, unten sechs mit ihm](../images/showcase.png)

Agent-Skill für kreative Arbeit: Namen, Geschichten, Spielideen, Plakate, Oberflächen. Das Modell nennt zuerst seine erste, durchschnittlichste Wahl und rückt dann mit einem Grund aus dem Projekt davon ab.

Beide Reihen stammen aus demselben Prompt: `Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` Die obere Reihe ist ein Durchgang mit sechs Läufen ohne den Skill, keiner aussortiert. Die untere Reihe ist aus etwa zwölf Läufen ausgewählt, die entstanden, während der Skill noch geschrieben wurde.

![Diagramm, wie oft eine Wahl getroffen wird: ein hoher Gipfel um den Durchschnitt, als sichere Zone markiert, auf beiden Seiten flach](../images/graph.png)

## Installation

Die [skills](https://github.com/vercel-labs/skills)-CLI legt ihn dort ab, wo dein Agent Skills liest, für Codex, Cursor, OpenCode, Claude Code und andere:

```
npx skills add mankidev/antialgorithm
```

Oder klone ihn in den Skills-Ordner deines Agenten:

```
git clone https://github.com/mankidev/antialgorithm <Skills-Ordner>/antialgorithm
```

In Claude Code lässt er sich auch als Plugin installieren (in Versionen vor 2.1.275 zuerst `/plugin marketplace add mankidev/antialgorithm` ausführen):

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

Die Skripte brauchen Python 3. `check.py` braucht außerdem numpy, Pillow und `rsvg-convert` (oder das Paket cairosvg).

## Skripte

`seed.py` würfelt einen Startpunkt, wenn die Anfrage wenig hergibt. Ein visueller Seed liefert eine Herstellungsweise, Farben, Layout, Schrift, ein Verb und einen Maßstab für die Idee, einen Schauplatz, eine Region und in der Hälfte der Fälle einen Gegenstand. Ein Text-Seed liefert eine Stimme, einen Einstieg und ein Register. Ein Ideen-Seed liefert ein Verb, eine Einschränkung, einen Maßstab und einen Druck. Er nutzt den Zufall des Systems, daher starten zwei Leute mit demselben Prompt an verschiedenen Stellen. Außerdem speichert er jeden Seed in `~/.local/state/antialgorithm/history.jsonl` (unter `$XDG_STATE_HOME`, wenn das gesetzt ist) und überspringt Werte der letzten paar, damit sich deine Seeds von Sitzung zu Sitzung nicht wiederholen. Plugin-Updates lassen diese Datei in Ruhe. `--keep "axis=value"` hält eine Achse fest, so bleibt das Thema und nur der Look wird neu gewürfelt.

`moves.py` führt ein kurzes Protokoll über den Hauptzug jeder Antwort, die vom Naheliegenden abweicht, etwa "neon tube wall, almost no type". Das Modell liest es, bevor es neue Arbeit zeigt, und greift so nicht zu einem Zug, nur weil er beim letzten Mal funktioniert hat.

`rough.py` nimmt ein SVG, bringt gerade Linien, Formen und Buchstaben ins Wackeln und bricht die gleichmäßigen Abstände wiederholter Zeichen auf, damit ein in Code gezeichneter Handarbeits-Look nicht mehr wie geplottet aussieht. Es ist nur für handgemachte Verfahren wie Druck, Farbe, Stempel und Tinte gedacht; Bildschirm-, Kamera- und Render-Looks behalten ihre eigenen Spuren.

`check.py` rendert ein SVG in voller Größe und in Icongröße und listet Text auf, der über einen Rand läuft, unter einer Form liegt, zu wenig Kontrast hat oder zu klein ist. Die Größengrenze passt für Plakate; für einen App-Bildschirm nimm `--min-text 0.6`.

Die visuellen Regeln stehen in `visuals.md`. Das Modell liest die Datei nur bei visueller Arbeit, ein Name oder ein Slogan lädt sie also nicht.

## Lizenz

MIT

## Sterne-Verlauf

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
