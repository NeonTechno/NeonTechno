const GLYPHS = " .,:;irsXA253hMHGS#9B&@";
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function hash2D(x, y, seed = 1) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

export function glyphForLuminance(luminance) {
  const index = Math.round(clamp(luminance, 0, 1) * (GLYPHS.length - 1));
  return GLYPHS[index];
}

function hsl(hue, saturation, lightness) {
  return `hsl(${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
}

function gaussian(x, y, cx, cy, sx, sy) {
  const dx = (x - cx) / sx;
  const dy = (y - cy) / sy;
  return Math.exp(-0.5 * (dx * dx + dy * dy));
}

export function sampleScene(x, y, time = 0, seed = 1) {
  const drift = time * 0.035;
  const warp = Math.sin(x * 19 + y * 11 + drift) * 0.018
    + Math.cos(x * 13 - y * 17 - drift * 0.7) * 0.014;
  const nx = x + warp;
  const ny = y - warp * 0.55;

  const cloudA = gaussian(nx, ny, 0.30 + Math.sin(drift) * 0.012, 0.48, 0.20, 0.23);
  const cloudB = gaussian(nx, ny, 0.48, 0.58 + Math.cos(drift * 0.8) * 0.014, 0.22, 0.17);
  const cloudC = gaussian(nx, ny, 0.59, 0.32, 0.16, 0.18);
  const turbulence = 0.55 + 0.22 * Math.sin(nx * 42 + ny * 27 + drift)
    + 0.15 * Math.cos(nx * 25 - ny * 39 - drift * 1.3);
  const nebula = clamp((cloudA * 0.78 + cloudB * 0.86 + cloudC * 0.62) * turbulence, 0, 1);

  const gx = nx - 0.39;
  const gy = (ny - 0.49) * 1.55;
  const radius = Math.hypot(gx, gy);
  const angle = Math.atan2(gy, gx);
  const arms = Math.pow(Math.max(0, (Math.cos(angle * 3.1 - Math.log(radius + 0.035) * 4.7 + drift) + 1) * 0.5), 7);
  const spiral = arms * Math.exp(-radius * 2.7) * 0.92;
  const core = Math.exp(-radius * 17) * 0.92;

  const px = nx - 0.785;
  const py = ny - 0.445;
  const planetRadius = Math.hypot(px, py * 1.68);
  const planet = planetRadius < 0.112;
  const ringRadius = Math.sqrt((px / 0.235) ** 2 + (py / 0.078) ** 2);
  const ring = Math.abs(ringRadius - 1) < 0.105 && nx > 0.56;
  const ringFront = ring && py > 0.018;

  if (ring && !planet && !ringFront) {
    const band = Math.sin(ringRadius * 110 + px * 80);
    const light = 43 + band * 9 + (1 - Math.abs(py) / 0.078) * 12;
    return { glyph: band > 0.25 ? "=" : "-", color: hsl(34 + band * 12, 88, light), layer: "rings", intensity: 0.8 };
  }

  if (planet) {
    const z = Math.sqrt(Math.max(0, 1 - (planetRadius / 0.112) ** 2));
    const lightVector = clamp(0.22 + (-px * 1.5 - py * 0.8 + z * 0.8) * 0.48, 0.04, 1);
    const bands = 0.12 * Math.sin(py * 220 + Math.sin(px * 45) * 1.5);
    const shade = clamp(lightVector + bands, 0, 1);
    return {
      glyph: glyphForLuminance(shade),
      color: hsl(27 + shade * 22, 94, 13 + shade * 58),
      layer: "planet",
      intensity: shade
    };
  }

  if (ringFront) {
    const band = Math.sin(ringRadius * 95 + px * 65);
    return { glyph: band > 0.15 ? "/" : "=", color: hsl(34 + band * 15, 90, 47 + band * 12), layer: "rings", intensity: 0.75 };
  }

  const cometX = ((time * 0.045 + 0.12) % 1.35) - 0.16;
  const cometY = 0.19 + Math.sin(time * 0.42) * 0.045;
  const cometDistance = Math.hypot((nx - cometX) * 1.25, (ny - cometY) * 2.1);
  if (cometDistance < 0.012) {
    return { glyph: cometDistance < 0.004 ? "@" : "*", color: "#c9fbff", layer: "comet", intensity: 1 };
  }
  if (nx < cometX && nx > cometX - 0.09 && Math.abs(ny - cometY) < (cometX - nx) * 0.45) {
    return { glyph: ".", color: hsl(190, 95, 55 + hash2D(Math.floor(nx * 900), Math.floor(ny * 500), seed) * 25), layer: "comet-tail", intensity: 0.55 };
  }

  const starValue = hash2D(Math.floor(nx * 720), Math.floor(ny * 420), seed);
  if (starValue > 0.994) {
    const twinkle = 0.55 + 0.45 * Math.sin(time * (1.4 + starValue * 3) + starValue * 90);
    return { glyph: starValue > 0.999 ? "+" : (starValue > 0.997 ? "*" : "."), color: hsl(190 + starValue * 45, 65, 62 + twinkle * 30), layer: "star", intensity: twinkle };
  }

  const brightness = clamp(nebula * 0.92 + spiral * 0.88 + core * 0.34, 0, 1);
  if (brightness > 0.075) {
    const hue = 250 + clamp((nx - 0.2) * 95 + Math.sin(ny * 12 + drift) * 28, 0, 105);
    const lum = 12 + brightness * 54;
    return {
      glyph: glyphForLuminance(brightness * (0.7 + 0.3 * (0.5 + turbulence * 0.5))),
      color: hsl(hue, 82 + brightness * 15, lum),
      layer: "nebula",
      intensity: brightness
    };
  }

  const dust = hash2D(Math.floor(nx * 250), Math.floor(ny * 180), seed + 9);
  if (dust > 0.992) return { glyph: ".", color: "#526080", layer: "dust", intensity: 0.2 };
  return { glyph: " ", color: "#080a18", layer: "void", intensity: 0 };
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function startRenderer() {
  const canvas = document.querySelector("#space");
  const ctx = canvas?.getContext("2d", { alpha: false });
  if (!canvas || !ctx) return;

  const pauseButton = document.querySelector("#pause");
  const rerollButton = document.querySelector("#reroll");
  const fullscreenButton = document.querySelector("#fullscreen");
  const detailInput = document.querySelector("#detail");
  const motionInput = document.querySelector("#motion");
  const status = document.querySelector("#status");
  const coordinates = document.querySelector("#coordinates");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let columns = 0;
  let rows = 0;
  let cellWidth = 8;
  let cellHeight = 14;
  let fontSize = 12;
  let seed = Math.floor(Math.random() * 100000);
  let paused = reducedMotion.matches;
  let lastFrame = 0;
  let elapsed = 0;
  let frameCount = 0;
  let fpsTime = 0;
  let fps = 0;
  let motionScale = reducedMotion.matches ? 0.35 : 1;
  let detailScale = Number(detailInput?.value || 1);
  let animationId = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fontSize = width < 480 ? 10 : 12;
    columns = clamp(Math.floor(width / (fontSize * 0.62) * detailScale), 42, 178);
    cellWidth = width / columns;
    cellHeight = fontSize * 1.24;
    rows = Math.ceil(height / cellHeight);
    ctx.font = `${fontSize}px "SFMono-Regular",Consolas,"Liberation Mono",monospace`;
    ctx.textBaseline = "alphabetic";
    render(elapsed);
  }

  function render(time) {
    ctx.fillStyle = "#050611";
    ctx.fillRect(0, 0, width, height);
    const offset = time * motionScale;
    for (let row = 0; row < rows; row += 1) {
      const y = (row + 0.5) / rows;
      for (let col = 0; col < columns; col += 1) {
        const x = (col + 0.5) / columns;
        const sample = sampleScene(x, y, offset, seed);
        if (sample.glyph === " ") continue;
        ctx.fillStyle = sample.color;
        ctx.fillText(sample.glyph, col * cellWidth, (row + 1) * cellHeight);
      }
    }
    if (coordinates) {
      coordinates.textContent = `X ${(0.39 + Math.sin(offset * 0.04) * 0.02).toFixed(3)} / Y ${(0.49 + Math.cos(offset * 0.03) * 0.01).toFixed(3)}`;
    }
  }

  function tick(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;
    if (!paused && !document.hidden) elapsed += delta;
    render(elapsed);
    frameCount += 1;
    fpsTime += delta;
    if (fpsTime >= 1) {
      fps = frameCount;
      frameCount = 0;
      fpsTime = 0;
      if (status) status.textContent = `RENDERER ONLINE · ${fps} FPS`;
    }
    animationId = window.requestAnimationFrame(tick);
  }

  function setPaused(nextPaused) {
    paused = nextPaused;
    pauseButton?.setAttribute("aria-pressed", String(paused));
    if (pauseButton) pauseButton.textContent = paused ? "▶ RESUME" : "Ⅱ PAUSE";
    if (status) status.textContent = paused ? "SIMULATION PAUSED" : "RENDERER ONLINE";
  }

  pauseButton?.addEventListener("click", () => setPaused(!paused));
  rerollButton?.addEventListener("click", () => {
    seed = Math.floor(Math.random() * 100000);
    elapsed = 0;
    render(elapsed);
  });
  detailInput?.addEventListener("input", () => {
    detailScale = Number(detailInput.value);
    resize();
  });
  motionInput?.addEventListener("input", () => {
    motionScale = Number(motionInput.value);
  });
  fullscreenButton?.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      if (status) status.textContent = "FULLSCREEN NOT AVAILABLE";
    }
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) lastFrame = 0;
  });
  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
    if (event.code === "Space") {
      event.preventDefault();
      setPaused(!paused);
    } else if (event.key.toLowerCase() === "r") {
      seed = Math.floor(Math.random() * 100000);
      elapsed = 0;
    } else if (event.key.toLowerCase() === "f") {
      fullscreenButton?.click();
    }
  });

  setPaused(paused);
  resize();
  animationId = window.requestAnimationFrame(tick);
  window.addEventListener("pagehide", () => window.cancelAnimationFrame(animationId), { once: true });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startRenderer, { once: true });
  } else {
    startRenderer();
  }
}
