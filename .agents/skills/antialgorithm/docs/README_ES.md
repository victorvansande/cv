<p align="center">
  <img src="../.claude-plugin/icon.png" width="140" height="140" alt="Curva de campana naranja con un punto lejos en la cola">
</p>

# antialgorithm

<p align="center">
  <a href="https://github.com/mankidev/antialgorithm/releases"><img src="https://img.shields.io/github/v/release/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="Latest release"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/github/license/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="MIT license"></a>
  <a href="https://github.com/mankidev/antialgorithm/stargazers"><img src="https://img.shields.io/github/stars/mankidev/antialgorithm?color=F07A1E&labelColor=171717" alt="GitHub stars"></a>
</p>

<p align="center"><sub><a href="../README.md">English</a> | <a href="README_TR.md">Türkçe</a> | <a href="README_ZH.md">简体中文</a> | <a href="README_JA.md">日本語</a> | <a href="README_KO.md">한국어</a> | Español | <a href="README_PT.md">Português</a> | <a href="README_DE.md">Deutsch</a> | <a href="README_FR.md">Français</a> | <a href="README_RU.md">Русский</a></sub></p>

![Arriba, seis carteles sin la skill; abajo, seis con ella](../images/showcase.png)

Skill de agente para trabajo creativo: nombres, historias, ideas de juego, carteles, interfaces. Hace que el modelo diga primero su elección más obvia y promedio, y luego se aleje de ella por una razón sacada del proyecto.

Las dos filas salieron del mismo prompt: `Design a poster for a music festival as a 400x600 SVG. Save the final SVG as final.svg in the current folder.` La fila de arriba es una tanda de seis ejecuciones sin la skill, sin descartar ninguna. La de abajo está elegida entre unas doce ejecuciones hechas mientras la skill aún se estaba escribiendo.

![Gráfica de cuántas veces se elige una opción: un pico alto alrededor de la media marcado como zona segura, plano a ambos lados](../images/graph.png)

## Instalación

La CLI [skills](https://github.com/vercel-labs/skills) la pone donde tu agente lee las skills, para Codex, Cursor, OpenCode, Claude Code y otros:

```
npx skills add mankidev/antialgorithm
```

O clónala en la carpeta de skills de tu agente:

```
git clone https://github.com/mankidev/antialgorithm <carpeta de skills>/antialgorithm
```

En Claude Code también se instala como plugin (en versiones anteriores a 2.1.275, ejecuta antes `/plugin marketplace add mankidev/antialgorithm`):

```
/plugin install antialgorithm --marketplace mankidev/antialgorithm
```

Los scripts necesitan Python 3. `check.py` además necesita numpy, Pillow y `rsvg-convert` (o el paquete cairosvg).

## Scripts

`seed.py` tira un punto de partida cuando la petición trae poca información. Una semilla visual da un método de hechura, colores, composición, tipografía, un verbo y una escala para la idea, un escenario, una región y, la mitad de las veces, un objeto. Una semilla de texto da una voz, una forma de entrar y un registro. Una semilla de idea da un verbo, una restricción, una escala y una presión. Usa el azar del sistema, así que dos personas que envían el mismo prompt empiezan en sitios distintos. También guarda cada semilla en `~/.local/state/antialgorithm/history.jsonl` (dentro de `$XDG_STATE_HOME` si está definido) y evita los valores de las últimas, para que tus semillas no se repitan de una sesión a otra. Las actualizaciones del plugin no tocan ese archivo. `--keep "axis=value"` fija un eje, lo que te deja mantener el tema y volver a tirar solo el aspecto.

`moves.py` lleva un registro corto de la jugada principal de cada respuesta que se aleja de lo obvio, como "neon tube wall, almost no type". El modelo lo lee antes de enseñar un trabajo nuevo, así no repite una jugada solo porque funcionó la última vez.

`rough.py` toma un SVG, hace temblar sus líneas rectas, formas y letras, y rompe el espaciado regular de las marcas repetidas, para que un aspecto hecho a mano dibujado con código deje de parecer trazado por un plóter. Es solo para métodos hechos a mano como la impresión, la pintura, los sellos y la tinta; los aspectos de pantalla, cámara y render conservan sus propias marcas.

`check.py` renderiza un SVG a tamaño completo y a tamaño de icono, y lista el texto que se sale de un borde, queda bajo una forma, tiene poco contraste o es demasiado pequeño. El límite de tamaño está pensado para carteles; para una pantalla de app usa `--min-text 0.6`.

Las reglas visuales están en `visuals.md`, que el modelo solo lee en trabajos visuales, así que un nombre o un eslogan no las carga.

## Licencia

MIT

## Historial de estrellas

<a href="https://star-history.com/#mankidev/antialgorithm&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date&theme=dark">
    <img src="https://api.star-history.com/svg?repos=mankidev/antialgorithm&type=Date" alt="Star history chart for mankidev/antialgorithm">
  </picture>
</a>
