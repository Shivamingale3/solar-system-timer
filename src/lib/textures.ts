import * as THREE from "three";

export function createGasGiantTexture(colors: string[]) {
  if (typeof document === "undefined") return null; // Server-side guard

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Fill Background
  ctx.fillStyle = colors[0];
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw Bands
  colors.forEach((color, i) => {
    if (i === 0) return;
    ctx.fillStyle = color;

    // Random bands
    for (let j = 0; j < 10; j++) {
      const y = Math.random() * 1024;
      const h = Math.random() * 100 + 20;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(0, y, 1024, h);
    }

    // Noise/Turbulence simulation (simple lines)
    for (let j = 0; j < 50; j++) {
      const y = Math.random() * 1024;
      const h = Math.random() * 5;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(0, y, 1024, h);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createRockyTexture(baseColor: string) {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  // Add noise
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = Math.random() * 2;
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(x, y, s, s);
  }
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = Math.random() * 2;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(x, y, s, s);
  }

  return new THREE.CanvasTexture(canvas);
}
