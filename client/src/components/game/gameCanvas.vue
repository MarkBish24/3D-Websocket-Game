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
import { getGameSocket } from "../../plugins/gameSocket.js";

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
    const targetHex = grid.getHoveredHex();
    grid.toggleSelectedHex(targetHex);

    if (targetHex) {
      const socket = getGameSocket();
      const roomId = gameStore.currentRoom?.roomId;

      if (socket && roomId) {
        // Broadcast the exact coordinates of the hex that was clicked!
        socket.emit("game:hex_clicked", {
          roomId,
          q: targetHex.q,
          r: targetHex.r,
          s: targetHex.s,
        });
      }
    }
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
  strokeColor = color, // Default the stroke to precisely match the fill if unmodified
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

const HEX_GRADIENT_SPEED = 1.5;
const HEX_GRADIENT_AMPLITUDE = 1.2;

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

  const selectedHex = grid.getSelectedHex();
  const hoveredHex = grid.getHoveredHex();

  // 1. Draw the base map first (skip the active hexes)
  for (const hex of grid.getHexes()) {
    if (hex === selectedHex || hex === hoveredHex) continue;

    const pixel = hexToPixel(hex.q, hex.r, hexSize);
    drawHex(
      ctx,
      pixel,
      hexSize - 1,
      hex.getRenderColor(),
      hex.getStrokeColor(),
    );
  }

  // 2. Draw Hovered Hex Second (renders on top of the map)
  if (hoveredHex && hoveredHex !== selectedHex) {
    const pixel = hexToPixel(hoveredHex.q, hoveredHex.r, hexSize);
    const renderSize =
      hexSize -
      1 +
      Math.sin(time / (150 * HEX_GRADIENT_SPEED)) * HEX_GRADIENT_AMPLITUDE; // slight pulsing scale
    drawHex(ctx, pixel, renderSize, hoveredHex.getRenderColor());
  }

  // 3. Draw Selected Hex Last (renders on top of everything)
  if (selectedHex) {
    const pixel = hexToPixel(selectedHex.q, selectedHex.r, hexSize);
    const renderSize =
      hexSize + Math.sin(time / (200 * HEX_GRADIENT_SPEED)) * 3; // dramatic pulsing scale

    // Draw the base selected hex first using its standard physical color
    drawHex(
      ctx,
      pixel,
      renderSize,
      selectedHex.getRenderColor(),
      selectedHex.getStrokeColor(),
    );

    // The physical scale bounces on Math.sin(time / 200).
    // The exact duration of one sine wave cycle is 2*PI. (400 * Math.PI = ~1256ms)
    const cycleTime = 400 * Math.PI * HEX_GRADIENT_SPEED;

    // Calculate a continuous tracker from 0.0 -> 1.0 that strictly flows outwards!
    const rhythmProgress = (time % cycleTime) / cycleTime;

    // Draw an expanding hexagonal wave! HTML5 Canvas doesn't have "hex gradients"
    // So we mathematically draw 3 layers of glowing hex borders to fake a thick wave band
    for (let i = 0; i < 3; i++) {
      // Stagger the rings slightly. Wrapping negative values to +1.0 ensures
      // the fading trail from the previous wave completely exits the edge instead of abruptly vanishing
      let ringProgress = rhythmProgress - i * 0.15;
      if (ringProgress < 0) ringProgress += 1.0;

      const ringSize = renderSize * ringProgress;

      // Opacity naturally flows from bright in the center to invisible flat at the edge
      const edgeFade = Math.max(0, 1 - ringProgress);
      // The master ring (i=0) is brightest, trailing rings are heavily dimmed
      const ringGlowAlpha = (0.9 - i * 0.4) * edgeFade;

      if (ringGlowAlpha > 0 && ringSize > 0) {
        const strokeGlow = `rgba(150, 240, 255, ${ringGlowAlpha})`;
        const fillGlow = `rgba(150, 240, 255, ${ringGlowAlpha * 0.15})`; // slight interior glow

        drawHex(ctx, pixel, ringSize, fillGlow, strokeGlow);
      }
    }
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
