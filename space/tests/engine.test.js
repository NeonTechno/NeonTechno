import test from "node:test";
import assert from "node:assert/strict";
import { clamp, smoothstep, hash2D, glyphForLuminance, sampleScene } from "../engine.js";

test("clamp keeps values inside the requested interval", () => {
  assert.equal(clamp(-4, 0, 1), 0);
  assert.equal(clamp(0.4, 0, 1), 0.4);
  assert.equal(clamp(8, 0, 1), 1);
});

test("smoothstep has stable endpoints and a midpoint", () => {
  assert.equal(smoothstep(0, 1, 0), 0);
  assert.equal(smoothstep(0, 1, 1), 1);
  assert.equal(smoothstep(0, 1, 0.5), 0.5);
});

test("hash2D is deterministic and returns a normalized value", () => {
  const first = hash2D(12, 24, 7);
  assert.equal(first, hash2D(12, 24, 7));
  assert.ok(first >= 0 && first < 1);
});

test("luminance maps to characters and clamps out-of-range values", () => {
  assert.equal(glyphForLuminance(0), " ");
  assert.equal(glyphForLuminance(1), "@");
  assert.equal(glyphForLuminance(-1), " ");
  assert.equal(glyphForLuminance(2), "@");
});

test("space samples are deterministic for a fixed time and seed", () => {
  const a = sampleScene(0.39, 0.49, 2.5, 17);
  const b = sampleScene(0.39, 0.49, 2.5, 17);
  assert.deepEqual(a, b);
  assert.equal(typeof a.glyph, "string");
  assert.equal(typeof a.color, "string");
  assert.ok(a.intensity >= 0 && a.intensity <= 1);
});

test("space sampler returns valid character samples across the scene", () => {
  for (let y = 0.05; y < 1; y += 0.1) {
    for (let x = 0.05; x < 1; x += 0.1) {
      const sample = sampleScene(x, y, 4.2, 99);
      assert.ok(sample.glyph.length === 1);
      assert.match(sample.color, /^(#|hsl\\()/);
      assert.ok(sample.intensity >= 0 && sample.intensity <= 1);
    }
  }
});
