import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join } from "node:path";

export async function validateProfileArt() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const files = ["nature-ascii.svg", "space-ascii.svg", "cyber-city-ascii.svg"];
  const reports = {};
  for (const file of files) {
    const svg = await readFile(join(root, file), "utf8");
    const checks = {
      svgRoot: /^<svg\b/.test(svg),
      svgClosed: /<\/svg>\s*$/.test(svg),
      hasTextGlyphs: /<text[ >]/.test(svg),
      hasAnimation: /animation|<animate/i.test(svg),
      noRasterImage: !/<image\b/i.test(svg),
      noCanvasOrScript: !/<(canvas|script)\b/i.test(svg)
    };
    if (file === "nature-ascii.svg") {
      checks.rainforestLayers = /canopy-drift/.test(svg) && /water-glint/.test(svg) && /ferns/.test(svg) && /wildlife/.test(svg);
    }
    if (file === "space-ascii.svg") {
      checks.denseGlyphField = (svg.match(/data-cells="120"/g) || []).length >= 110;
      checks.orbitalDetails = /moon-clip/.test(svg) && /ORBITAL-07/.test(svg);
      checks.galaxySystems = /ring-back/.test(svg) && /ring-front/.test(svg) && /animateMotion/.test(svg);
    }
    if (file === "cyber-city-ascii.svg") {
      checks.cityLayers = /NEON DISTRICT/.test(svg) && /AUTONOMOUS TRANSIT/.test(svg) && /windows-extra/.test(svg);
    }
    reports[file] = {valid:Object.values(checks).every(Boolean),checks,bytes:Buffer.byteLength(svg)};
  }
  return reports;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateProfileArt().then(reports => {
    for (const [file,report] of Object.entries(reports)) {
      if (!report.valid) throw new Error(file + " validation failed: " + JSON.stringify(report.checks));
      console.log("SVG valid:",file,report.bytes,"bytes");
    }
  }).catch(error => { console.error(error); process.exitCode = 1; });
}
