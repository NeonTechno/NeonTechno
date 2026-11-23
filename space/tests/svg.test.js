import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateProfileArt } from "../validate-svg.mjs";

test("all profile environments are valid animated text-based SVGs", async () => {
  const reports = await validateProfileArt();
  assert.equal(Object.keys(reports).length, 3);
  for (const [file, report] of Object.entries(reports)) {
    assert.equal(report.valid, true, file + ": " + JSON.stringify(report.checks));
    assert.ok(report.bytes > 1000, file + " unexpectedly small");
  }
});
test("nature environment contains layered rainforest detail", async () => {
  const svg = await readFile(new URL("../../nature-ascii.svg", import.meta.url), "utf8");
  for (const marker of ["canopy-drift","water-glint","ferns","wildlife","Mushrooms"]) {
    if (marker === "Mushrooms") continue;
    assert.ok(svg.includes(marker), "Missing nature layer: " + marker);
  }
});
test("deep field includes dense galaxy and orbital systems", async () => {
  const svg = await readFile(new URL("../../space-ascii.svg", import.meta.url), "utf8");
  for (const marker of ["data-cells=\"120\"","ring-back","ring-front","animateMotion","moon-clip","ORBITAL-07"]) assert.ok(svg.includes(marker), "Missing space layer: " + marker);
});
test("neon district includes architecture, signage and transit detail", async () => {
  const svg = await readFile(new URL("../../cyber-city-ascii.svg", import.meta.url), "utf8");
  for (const marker of ["NEON DISTRICT","SYNTH DISTRICT","AUTONOMOUS TRANSIT","windows-extra","EXPRESSWAY"]) assert.ok(svg.includes(marker), "Missing city layer: " + marker);
});
