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
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useGameStore } from "../../stores/gameStore.js";
import { Hex } from "./hex.js";

const gameStore = useGameStore();

const gameCanvas = ref(null);
let ctx = null;
let animationFrameId = null;
let currentHoverHex = null; // Stores {q,r,s} of the hex currently being hovered

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
  gameLoop();

  // Reactively rebuild the hex map whenever the server sends board data
  watch(
    () => gameStore.currentRoom?.board?.hexes,
    (hexes) => {
      if (hexes) loadMap();
    },
    { immediate: true }
  );
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

  // Get the exact physical bounds of the canvas so CSS padding/Navbars don't break our mouse tracking!
  const rect = gameCanvas.value.getBoundingClientRect();
  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  // Correctly adjust for the camera zoom scale
  const mouseX = (rawX - gameCanvas.value.width / 2 - camera.x) / camera.zoom;
  const mouseY = (rawY - gameCanvas.value.height / 2 - camera.y) / camera.zoom;

  const hexCoords = pixelToHex(mouseX, mouseY);
  const roundedHex = cubeRound(hexCoords);

  currentHoverHex = roundedHex;

  // IMPORTANT: Let the Hex objects themselves know if they are being hovered!
  let isHoveringValidHex = false;
  hexes.forEach((hex) => {
    hex.isHovered = hex.q === roundedHex.q && hex.r === roundedHex.r;
    if (hex.isHovered) isHoveringValidHex = true;
  });

  // Dynamically update the mouse cursor so players know they can click!
  if (isDragging) {
    gameCanvas.value.style.cursor = "grabbing";
  } else if (isHoveringValidHex) {
    gameCanvas.value.style.cursor = "pointer";
  } else {
    gameCanvas.value.style.cursor = "grab"; // Empty space background
  }
};

const handleMouseDown = (e) => {
  isDragging = true;
  if (gameCanvas.value) gameCanvas.value.style.cursor = "grabbing";
};

const handleMouseUp = (e) => {
  isDragging = false;
  // Fall back to pointer check via movement or grab by default when released
  if (gameCanvas.value) gameCanvas.value.style.cursor = "grab";
};

const handleMouseLeave = (e) => {
  isDragging = false;
  if (gameCanvas.value) gameCanvas.value.style.cursor = "grab";
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

const hexes = []; // array to store the generated hex coordinates {q,r,s}

// 1. convert math coordinates (q, r) to physical screen pixels (x, y)
function hexToPixel(q, r, size = hexSize) {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

function pixelToHex(x, y, size = hexSize) {
  // mathematically, the 1/3 and 2/3 must be divided by the size explicitly!
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
  const r = ((2 / 3) * y) / size;
  const s = -q - r;
  return { q, r, s };
}

const cubeRound = (frac) => {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);

  const qDiff = Math.abs(q - frac.q);
  const rDiff = Math.abs(r - frac.r);
  const sDiff = Math.abs(s - frac.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }
  return { q, r, s };
};

// 2. generate a perfectly smmetrical grid by looping cube contraints
const loadMap = () => {
  const boardData = gameStore.currentRoom?.board?.hexes ?? [];

  hexes.length = 0;

  boardData.forEach((hexData) => {
    hexes.push(new Hex(hexData));
  });
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
    // Let the Hex object dynamically calculate its own color based on its internal state!
    drawHex(ctx, pixel, hexSize - 1, hex.getRenderColor());
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
