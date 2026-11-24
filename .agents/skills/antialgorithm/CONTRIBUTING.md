# Contributing

Issues and pull requests are welcome. Small fixes can go straight to a pull request. For a new rule in `SKILL.md` or `visuals.md`, open an issue first with an example of the output that made you want it.

## Skill text

`SKILL.md` and `visuals.md` are read by the model, so the wording is the behavior. Keep it in plain English with short sentences, and name things the way a person would say them.

The skill has to work for anyone who installs it. Don't name other skills, tools, people or projects in the text, and keep examples general. A rule that only makes sense for your own setup belongs in your own `CLAUDE.md` or `AGENTS.md`.

Visual rules go in `visuals.md`, the rest in `SKILL.md`. Keep `SKILL.md` short, since it loads on any creative request.

## Testing a change to the skill text

Run the same prompt several times with the old text and with the new one, then compare the two sets side by side. A single good result proves little. If the results in a set share one look, as if made by the same hand, the skill has found a new default. The poster prompt from the README is a good start:

```
Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.
```

Mention in the pull request what you ran and what changed in the results. Screenshots help.

## Scripts

The scripts in `scripts/` use only the Python 3 standard library, except `check.py`, which also needs numpy, Pillow and `rsvg-convert` or cairosvg. Please don't add new dependencies.

They should run on Linux, macOS and Windows. Use `os.path` for paths and open text files with `encoding="utf-8"`.

The code has no comments or docstrings. Pick clear names instead, and put the reasoning in the pull request description.

Before you open a pull request, run the parts you touched:

```
python3 scripts/seed.py visual --no-log
python3 scripts/seed.py text --no-log
python3 scripts/seed.py idea --no-log
python3 scripts/check.py some.svg
python3 scripts/rough.py some.svg rough.svg
```

Seed and move history is saved in `~/.local/state/antialgorithm/`, outside the repo. If you test with `ANTIALGORITHM_HISTORY` pointing somewhere else, don't commit that file.

## README and translations

The README has translations in `docs/`. If you change the English README, you don't have to update them all. Update the languages you can read, and say in the pull request which ones are now behind.

## License

By contributing you agree that your work is released under the MIT license of this project.
