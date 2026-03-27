<template>
  <div class="game-container">
    <canvas
      ref="gameCanvas"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @wheel="handleWheel"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const gameCanvas = ref(null);
let ctx = null;

onMounted(() => {
  gameCanvas.value.width = window.innerWidth;
  gameCanvas.value.height = window.innerHeight;
  ctx = gameCanvas.value.getContext("2d");
  generateMap();
  drawMap();
});

// Game State
const hexSize = 35; // pixel radius of each hexagon
const mapRadius = 8; // number of rings outward from the center

const hexes = []; // array to store the generated hex coordinates {q,r,s}

// 1. convert math coordinates (q, r) to physical screen pixels (x, y)
function hexToPixel(q, r, size = hexSize) {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

// 2. generate a perfectly smmetrical grid by looping cube contraints
const generateMap = () => {
  for (let q = -mapRadius; q <= mapRadius; q++) {
    const r1 = Math.max(-mapRadius, -q - mapRadius);
    const r2 = Math.min(mapRadius, -q + mapRadius);

    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      hexes.push({ q, r, s });
    }
  }
};

// 3. physically draw 6 lines to form a hexagon
const drawHex = (
  ctx,
  center,
  size,
  color = "#2f2f2f",
  strokeColor = "#3f3f3f",
) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30; // 30 degree offset
    const angle_rad = (Math.PI / 180) * angle_deg;
    const px = center.x + size * Math.cos(angle_rad);
    const py = center.y + size * Math.sin(angle_rad);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();
};

const drawMap = () => {
  if (!ctx || !gameCanvas.value) return;
  ctx.clearRect(0, 0, gameCanvas.value.width, gameCanvas.value.height);

  // center the map
  const centerX = gameCanvas.value.width / 2;
  const centerY = gameCanvas.value.height / 2;

  hexes.forEach((hex) => {
    const pixel = hexToPixel(hex.q, hex.r, hexSize);
    const center = {
      x: centerX + pixel.x,
      y: centerY + pixel.y,
    };
    drawHex(ctx, center, hexSize);
  });
};
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: calc(100vh - 64px);

  overflow: hidden;
  background-color: #0c111d;
}

canvas {
  display: block;
}
</style>
