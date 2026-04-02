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
import { HexGrid } from "./hexGrid.js";

const gameStore = useGameStore();

const gameCanvas = ref(null);
let ctx = null;
let animationFrameId = null;
const grid = new HexGrid();
let camera = {
  x: 0,
  y: 0,
  zoom: 1,
};
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };

onMounted(() => {
  gameCanvas.value.width = window.innerWidth / 2;
  gameCanvas.value.height = window.innerHeight / 2;
  gameCanvas.value.style.backgroundColor = "#000000";
  ctx = gameCanvas.value.getContext("2d");
  gameLoop();

  // Reactively rebuild the hex map whenever the server sends board data
  watch(
    () => gameStore.currentRoom?.board?.hexes,
    (hexes) => {
      if (hexes) loadMap();
    },
    { immediate: true },
  );
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});

let dragHasMoved = false;

const handleMouseMove = (e) => {
  if (isDragging) {
    dragHasMoved = true;
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

  const targetHex = grid.getHex(roundedHex.q, roundedHex.r) || null;
  
  // O(1) Hover State Update!
  if (grid.getHoveredHex() !== targetHex) {
    grid.toggleHoveredHex(targetHex);
  }

  // Dynamically update the mouse cursor so players know they can click!
  if (isDragging) {
    gameCanvas.value.style.cursor = "grabbing";
  } else if (grid.getHoveredHex()) {
    gameCanvas.value.style.cursor = "pointer";
  } else {
    gameCanvas.value.style.cursor = "grab"; // Empty space background
  }
};

const handleMouseDown = (e) => {
  isDragging = true;
  dragHasMoved = false;
  if (gameCanvas.value) gameCanvas.value.style.cursor = "grabbing";
};

const handleMouseUp = (e) => {
  isDragging = false;
  
  // Handle O(1) click selection if the mouse wasn't dragged
  if (!dragHasMoved) {
    grid.toggleSelectedHex(grid.getHoveredHex());
  }

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

  grid.hexes.clear();
  grid.selectedHex = null;
  grid.hoveredHex = null;

  boardData.forEach((hexData) => {
    grid.addHex(new Hex(hexData));
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

  const time = performance.now();

  for (const hex of grid.getHexes()) {
    const pixel = hexToPixel(hex.q, hex.r, hexSize);
    let renderSize = hexSize - 1;
    
    // Apply a subtle floating or bobbing animation for hovered and selected states
    if (hex.isSelected) {
      // Bobbing effect up and down
      pixel.y += Math.sin(time / 200) * 3;
      renderSize = hexSize; // Slightly larger
    } else if (hex.isHovered) {
      // Very slight bobbing for hovered
      pixel.y += Math.sin(time / 150) * 1.5;
    }

    // Let the Hex object dynamically calculate its own color based on its internal state!
    drawHex(ctx, pixel, renderSize, hex.getRenderColor());
  }
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
