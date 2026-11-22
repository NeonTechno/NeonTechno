import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";

export function validateSvg(svg) {
  const checks = {
    svgRoot: /^<svg\\b/.test(svg),
    viewBox: /viewBox="0 0 1200 660"/.test(svg),
    denseGlyphField: (svg.match(/<tspan/g) || []).length >= 13200,
    starfield: (svg.match(/class="star"/g) || []).length >= 180,
    spiralAndNebulaMotion: /class="nebula"[^>]*|class="nebula"/.test(svg) && /nebula-drift/.test(svg),
    ringOcclusionLayers: /ring-back/.test(svg) && /ring-front/.test(svg),
    clippedPlanet: /clip-path="url\\(#planet-clip\\)"/.test(svg),
    movingComet: /animateMotion/.test(svg),
    reducedMotionSupport: /prefers-reduced-motion/.test(svg),
    colourPalette: /class="p15"/.test(svg)
  };
  return { valid: Object.values(checks).every(Boolean), checks, glyphs: (svg.match(/<tspan/g) || []).length, stars: (svg.match(/class="star"/g) || []).length };
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const source = await readFile(join(root, "space-ascii.svg"), "utf8");
  const preview = await readFile(join(dirname(fileURLToPath(import.meta.url)), "space-ascii.svg"), "utf8");
  const report = validateSvg(source);
  if (!report.valid) throw new Error("SVG validation failed: " + JSON.stringify(report.checks));
  if (source !== preview) throw new Error("Pages preview SVG differs from the profile SVG.");
  console.log("SVG valid:", report.glyphs, "glyph cells;", report.stars, "animated stars.");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e); process.exitCode = 1; });
