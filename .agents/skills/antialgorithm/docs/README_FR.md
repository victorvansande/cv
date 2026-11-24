<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="Courbe en cloche orange avec un point loin sur la queue">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | <a href="README_ZH.md">简体中文</a> | <a href="README_JA.md">日本語</a> | <a href="README_KO.md">한국어</a> | <a href="README_ES.md">Español</a> | <a href="README_PT.md">Português</a> | <a href="README_DE.md">Deutsch</a> | Français | <a href="README_RU.md">Русский</a></sub></p>

![En haut, six affiches sans le skill ; en bas, six avec](../images/showcase.png)

Skill d'agent pour le travail créatif : noms, histoires, idées de jeu, affiches, interfaces. Il fait d'abord dire au modèle son premier choix, le plus moyen, puis l'en éloigne pour une raison tirée du projet.

Les deux rangées viennent du même prompt : `Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` La rangée du haut est une série de six essais sans le skill, aucun écarté. Celle du bas a été choisie parmi une douzaine d'essais faits pendant l'écriture du skill.

![Graphique de la fréquence à laquelle un choix est fait : un pic haut autour de la moyenne, marqué zone sûre, plat des deux côtés](../images/graph.png)

## Installation

La CLI [skills](https://github.com/vercel-labs/skills) le place là où votre agent lit ses skills, pour Codex, Cursor, OpenCode, Claude Code et d'autres :

```
npx skills add mankidev/antialgorithm
```

Ou clonez-le dans le dossier de skills de votre agent :

```
git clone https://github.com/mankidev/antialgorithm <dossier de skills>/antialgorithm
```

Dans Claude Code, il s'installe aussi comme plugin (sur les versions antérieures à 2.1.275, lancez d'abord `/plugin marketplace add mankidev/antialgorithm`) :

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

Les scripts demandent Python 3. `check.py` demande aussi numpy, Pillow et `rsvg-convert` (ou le paquet cairosvg).

## Scripts

`seed.py` tire un point de départ quand la demande est maigre. Une graine visuelle donne une façon de fabriquer, des couleurs, une mise en page, une typo, un verbe et une échelle pour l'idée, un décor, une région et, une fois sur deux, un objet. Une graine de texte donne une voix, une entrée en matière et un registre. Une graine d'idée donne un verbe, une contrainte, une échelle et une pression. Elle puise dans l'aléa du système, donc deux personnes qui envoient le même prompt partent de deux endroits différents. Chaque graine est aussi enregistrée dans `~/.local/state/antialgorithm/history.jsonl` (sous `$XDG_STATE_HOME` si la variable existe), et les valeurs des dernières sont évitées, pour que vos graines ne se répètent pas d'une session à l'autre. Les mises à jour du plugin ne touchent pas ce fichier. `--keep "axis=value"` bloque un axe, ce qui permet de garder un sujet et de ne retirer que l'apparence.

`moves.py` tient un court journal du coup principal derrière chaque réponse qui s'écarte du choix par défaut, par exemple "neon tube wall, almost no type". Le modèle le lit avant de montrer un nouveau travail, pour ne pas reprendre un coup simplement parce qu'il a marché la dernière fois.

`rough.py` prend un SVG, fait trembler ses lignes droites, ses formes et ses lettres, et casse l'espacement régulier des marques répétées, pour qu'un rendu fait main dessiné en code n'ait plus l'air sorti d'un traceur. Il ne sert qu'aux méthodes faites main comme l'impression, la peinture, le tampon et l'encre ; les rendus écran, photo et 3D gardent leurs propres marques.

`check.py` rend un SVG en taille réelle et en taille d'icône, et liste le texte qui dépasse un bord, passe sous une forme, manque de contraste ou est trop petit. La limite de taille est réglée pour les affiches ; pour un écran d'application, utilisez `--min-text 0.6`.

Les règles visuelles sont dans `visuals.md`, que le modèle ne lit que pour le travail visuel. Un nom ou un slogan ne les charge donc pas.

## Licence

MIT

## Historique des étoiles

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
