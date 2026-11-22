# Deep Field — SVG ASCII Environment

The cosmic artwork is a self-contained, animated SVG character renderer. The SVG itself is the rendering source: it uses coloured text glyphs, gradients, clipping, and native SVG/CSS animation. No Canvas, WebGL, raster screenshots, external image service, API key, or runtime JavaScript is required to display it.

## Scene architecture
- 120 × 55 character matrix (13,200 glyph cells), with per-character colour classes.
- Procedural-looking layered nebula clouds, warped turbulence, three spiral arms, galactic core and star/noise field.
- A second ASCII glyph matrix shades a spherical gas giant, clipped to its silhouette.
- Individually positioned and rotated ring characters are split into rear and front layers, creating planet occlusion.
- CSS animation adds star twinkle, slow nebula drift and a rotating atmospheric rim; SVG animateMotion moves the comet.
- Reduced-motion preferences disable continuous CSS animation.

## Files
- ../space-ascii.svg — canonical GitHub profile artwork.
- space-ascii.svg — identical asset served by the GitHub Pages preview.
- index.html and style.css — lightweight presentation wrapper.
- validate-svg.mjs and tests — structural and consistency checks.

## Validate
Run npm run check and npm test from this directory.
