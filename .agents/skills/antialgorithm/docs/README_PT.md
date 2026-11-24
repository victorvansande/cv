<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="Curva de sino laranja com um ponto longe na cauda">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | <a href="README_ZH.md">简体中文</a> | <a href="README_JA.md">日本語</a> | <a href="README_KO.md">한국어</a> | <a href="README_ES.md">Español</a> | Português | <a href="README_DE.md">Deutsch</a> | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![Em cima, seis pôsteres sem a skill; embaixo, seis com ela](../images/showcase.png)

Skill de agente para trabalho criativo: nomes, histórias, ideias de jogo, pôsteres, interfaces. Faz o modelo dizer primeiro a escolha mais óbvia e mediana, e depois se afastar dela por um motivo tirado do projeto.

As duas fileiras saíram do mesmo prompt: `Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` A de cima é um lote de seis execuções sem a skill, sem nenhuma descartada. A de baixo foi escolhida entre cerca de doze execuções feitas enquanto a skill ainda estava sendo escrita.

![Gráfico de quantas vezes uma escolha é feita: um pico alto em torno da média marcado como zona segura, plano dos dois lados](../images/graph.png)

## Instalação

A CLI [skills](https://github.com/vercel-labs/skills) coloca a skill onde o seu agente lê skills, para Codex, Cursor, OpenCode, Claude Code e outros:

```
npx skills add mankidev/antialgorithm
```

Ou clone na pasta de skills do seu agente:

```
git clone https://github.com/mankidev/antialgorithm <pasta de skills>/antialgorithm
```

No Claude Code ela também se instala como plugin (em versões anteriores à 2.1.275, rode antes `/plugin marketplace add mankidev/antialgorithm`):

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

Os scripts precisam de Python 3. O `check.py` também precisa de numpy, Pillow e `rsvg-convert` (ou do pacote cairosvg).

## Scripts

`seed.py` sorteia um ponto de partida quando o pedido traz pouca informação. Uma semente visual dá um método de feitura, cores, layout, tipografia, um verbo e uma escala para a ideia, um cenário, uma região e, em metade das vezes, um objeto. Uma semente de texto dá uma voz, uma forma de entrar e um registro. Uma semente de ideia dá um verbo, uma restrição, uma escala e uma pressão. Ela usa a aleatoriedade do sistema, então duas pessoas que mandam o mesmo prompt começam em lugares diferentes. Também salva cada semente em `~/.local/state/antialgorithm/history.jsonl` (dentro de `$XDG_STATE_HOME`, se estiver definido) e pula os valores das últimas, para que as suas sementes não se repitam de uma sessão para outra. Atualizações do plugin não mexem nesse arquivo. `--keep "axis=value"` fixa um eixo, o que permite manter o tema e sortear só a aparência.

`moves.py` guarda um registro curto do lance principal de cada resposta que foge do óbvio, como "neon tube wall, almost no type". O modelo lê esse registro antes de mostrar um trabalho novo, assim não repete um lance só porque ele funcionou da última vez.

`rough.py` pega um SVG, faz tremer suas linhas retas, formas e letras e quebra o espaçamento regular das marcas repetidas, para que um visual feito à mão desenhado em código deixe de parecer saído de uma plotter. Serve só para métodos feitos à mão, como impressão, pintura, carimbo e tinta; visuais de tela, câmera e render mantêm as próprias marcas.

`check.py` renderiza um SVG em tamanho cheio e em tamanho de ícone e lista o texto que passa da borda, fica sob uma forma, tem pouco contraste ou é pequeno demais. O limite de tamanho é pensado para pôsteres; para uma tela de app, use `--min-text 0.6`.

As regras visuais ficam em `visuals.md`, que o modelo só lê em trabalho visual, então um nome ou um slogan não as carrega.

## Licença

MIT

## Histórico de estrelas

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
