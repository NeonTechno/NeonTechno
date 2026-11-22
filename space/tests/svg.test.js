import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateSvg } from "../validate-svg.mjs";

test("profile SVG is a dense, animated character renderer", async () => {
  const svg = await readFile(new URL("../../space-ascii.svg", import.meta.url), "utf8");
  const report = validateSvg(svg);
  assert.equal(report.valid, true, JSON.stringify(report.checks));
  assert.ok(report.glyphs >= 13200);
  assert.ok(report.stars >= 180);
});
test("SVG includes all visual systems", async () => {
  const svg = await readFile(new URL("../../space-ascii.svg", import.meta.url), "utf8");
  for (const marker of ["spiral", "nebula-drift", "planet-clip", "ring-back", "ring-front", "animateMotion", "prefers-reduced-motion", "DEEP FIELD"]) {
    assert.ok(svg.includes(marker), "Missing SVG layer: " + marker);
  }
});
test("GitHub Pages preview is byte-for-byte identical to profile artwork", async () => {
  const [profile, preview] = await Promise.all([
    readFile(new URL("../../space-ascii.svg", import.meta.url), "utf8"),
    readFile(new URL("../space-ascii.svg", import.meta.url), "utf8")
  ]);
  assert.equal(preview, profile);
});
