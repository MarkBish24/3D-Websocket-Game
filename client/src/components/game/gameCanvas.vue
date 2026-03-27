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
import { Hex } from "./Hex.js";

const gameCanvas = ref(null);
let ctx = null;
let animationFrameId = null;

let camera = {
  x: 0,
  y: 0,
  zoom: 1,
};
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };

onMounted(() => {
  gameCanvas.value.width = window.innerWidth;
  gameCanvas.value.height = window.innerHeight;
  ctx = gameCanvas.value.getContext("2d");
  generateMap();
  gameLoop();
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});

const handleMouseMove = (e) => {
  if (isDragging) {
    camera.x += e.clientX - lastMousePos.x;
    camera.y += e.clientY - lastMousePos.y;
  }
  lastMousePos = { x: e.clientX, y: e.clientY };
};

const handleMouseDown = (e) => {
  isDragging = true;
};

const handleMouseUp = (e) => {
  isDragging = false;
};

const handleMouseLeave = (e) => {
  isDragging = false;
};

const handleWheel = (e) => {
  e.preventDefault(); // prevents the whole browser from zooming

  // Standard scroll behavior: scroll down (positive delta) = zoom out (-1).
  const zoomDirection = e.deltaY > 0 ? -1 : 1;

  // Using 0.05 gives you buttery smooth zooming instead of jumping massive chunks!
  camera.zoom += zoomDirection * 0.02;
  camera.zoom = Math.max(0.1, Math.min(5, camera.zoom)); // clamp zoom between 0.1x and 5x
};

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

      // instantiate a new Hex object
      const tile = new Hex(q, r, s);

      // 2. Modify properties based on its position
      if (r >= mapRadius - 2) {
        tile.type = "spawn";
        tile.owner = "blue";
        tile.color = "rgba(60, 150, 255, 0.2)";
      } else if (r <= -mapRadius + 2) {
        tile.type = "spawn";
        tile.owner = "red";
        tile.color = "rgba(255, 80, 80, 0.2)";
      } else if (q === 0 && r === 0 && s === 0) {
        tile.type = "checkpoint";
        tile.color = "rgba(255, 215, 0, 0.4)";
      }
      // 3. Push it!
      hexes.push(tile);
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

const gameLoop = () => {
  if (!ctx || !gameCanvas.value) return;
  ctx.clearRect(0, 0, gameCanvas.value.width, gameCanvas.value.height);

  ctx.save();
  ctx.translate(
    gameCanvas.value.width / 2 + camera.x,
    gameCanvas.value.height / 2 + camera.y,
  );
  ctx.scale(camera.zoom, camera.zoom);

  hexes.forEach((hex) => {
    const pixel = hexToPixel(hex.q, hex.r, hexSize);
    // Overwrite the default color parameter with the hex object's specific color
    drawHex(ctx, pixel, hexSize - 1, hex.color);
  });
  ctx.restore();

  animationFrameId = requestAnimationFrame(gameLoop);
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
