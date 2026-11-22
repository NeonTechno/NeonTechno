# Cosmic ASCII Engine

A dependency-free, browser-based ASCII environment renderer. The scene is drawn character-by-character on an HTML canvas: every visible mark is a text glyph selected from a luminance palette and coloured according to its simulated layer.

## Run locally

From this directory, serve the files over HTTP (ES modules are not supported reliably from `file://`):

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Controls

- **Detail** changes the character-grid resolution.
- **Motion** changes simulation speed.
- **Pause / Resume** freezes or resumes time.
- **New Field** changes the procedural star seed.
- **Fullscreen** expands the scene.
- Keyboard: `Space` pause/resume, `R` new field, `F` fullscreen.

The renderer respects reduced-motion preferences, caps device pixel ratio for performance, pauses time while the tab is hidden, and has no runtime dependencies or API keys.

## Scene layers

- Procedural nebula clouds and spiral-galaxy arms
- Luminance-mapped ASCII shading
- A shaded ringed planet with front/back ring occlusion
- Deterministic starfield, twinkling, dust and a moving comet
- Responsive grid sizing and chromatic HSL colour mapping

## Tests

```bash
npm test
npm run check
```
