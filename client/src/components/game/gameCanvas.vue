<template>
  <div class="game-container">
    <canvas
      ref="gameCanvas"
      @mousemove="handleMouseMove"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
      @wheel="handleWheel"
      @contextmenu.prevent
    ></canvas>
  </div>
</template>

<script setup>
// ========================================
// IMPORTS
// ========================================
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useGameStore } from "../../stores/gameStore.js";
import { useGameTheme } from "../../composables/useGameTheme.js";
import { Hex } from "./hex.js";
import { HexGrid } from "./hexGrid.js";
import { getGameSocket } from "../../plugins/gameSocket.js";
import { Unit } from "./unit.js";

// ========================================
// REACTIVE REFERENCES AND STORES
// ========================================
const { gameColors } = useGameTheme();
const gameStore = useGameStore();
const socket = getGameSocket();
const gameCanvas = ref(null);

// ========================================
// GAME STATE VARIABLES
// ========================================
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
let isRightDragging = false;
let rightDragMoved = false;
let liveDragPath = [];
let destinationHex = null;

// ========================================
// DOUBLE-CLICK DETECTION VARIABLES
// ========================================
let lastRightDownTime = 0;
let isRightDoubleClick = false;
let rightClickFirstHex = null;

// ========================================
// CONSTANTS
// ========================================
const DOUBLE_CLICK_MS = 400;
const TICK_DURATION = 500; // ms
const hexSize = 35; // pixel radius of each hexagon
const HEX_GRADIENT_SPEED = 1.5;
const HEX_GRADIENT_AMPLITUDE = 1.2;

// ========================================
// LIFECYCLE HOOKS
// ========================================
onMounted(() => {
  gameCanvas.value.width = window.innerWidth / 1.5;
  gameCanvas.value.height = window.innerHeight / 1.5;
  ctx = gameCanvas.value.getContext("2d");
  gameLoop();

  // Sync the canvas and container background color with the active Vuetify theme
  watch(
    () => gameColors.value.background,
    (bg) => {
      if (gameCanvas.value) gameCanvas.value.style.backgroundColor = bg;
    },
    { immediate: true },
  );

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

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Pathfinding helpers
const HEX_DIRECTIONS = [
  { q: 1, r: -1, s: 0 },
  { q: 1, r: 0, s: -1 },
  { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 },
  { q: -1, r: 0, s: 1 },
  { q: 0, r: -1, s: 1 },
];

const getMyFaction = () => {
  const currentRoom = gameStore.currentRoom;
  const userId = JSON.parse(localStorage.getItem("user")).id;

  if (!currentRoom || !currentRoom.players || currentRoom.players.length < 2)
    return null;
  return currentRoom.players[0].id === userId ? "red" : "green";
};

// Unique string key for a hex — used as Map keys in A*
const hexKey = (h) => `${h.q},${h.r},${h.s}`;

function hexDist(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function isNeighbor(a, b) {
  return hexDist(a, b) === 1;
}

// A* — uniform cost (every walkable tile costs 1), obstacles are walls
function findAStarPath(start, goal) {
  const openSet = [{ hex: start, g: 0, f: hexDist(start, goal) }];
  const cameFrom = new Map(); // neighborKey → parentKey
  const gScore = new Map([[hexKey(start), 0]]);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f); // lowest f first
    const { hex: current } = openSet.shift();

    if (current === goal) return reconstructPath(cameFrom, hexKey(current));

    const curKey = hexKey(current);
    for (const dir of HEX_DIRECTIONS) {
      const nb = grid.getHex(current.q + dir.q, current.r + dir.r);
      if (!nb || nb.type === "obstacle") continue; // nb.type not nb.getType()

      const nbKey = hexKey(nb);
      const tentG = gScore.get(curKey) + 1;
      if (tentG < (gScore.get(nbKey) ?? Infinity)) {
        cameFrom.set(nbKey, curKey);
        gScore.set(nbKey, tentG);
        openSet.push({ hex: nb, g: tentG, f: tentG + hexDist(nb, goal) });
      }
    }
  }
  return []; // no path found
}

function reconstructPath(cameFrom, endKey) {
  const path = [];
  let cur = endKey; // cur is always a key string
  while (cur) {
    const [q, r] = cur.split(",").map(Number);
    path.unshift(grid.getHex(q, r));
    cur = cameFrom.get(cur);
  }
  return path.filter(Boolean);
}

// Walk every hex in the grid to find the nearest checkpoint
function findNearestCheckpoint(fromHex) {
  let nearest = null,
    minD = Infinity;
  for (const h of grid.getHexes()) {
    if (h.type === "checkpoint") {
      const d = hexDist(fromHex, h);
      if (d < minD) {
        minD = d;
        nearest = h;
      }
    }
  }
  return nearest;
}

// Hex coordinate conversions
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

// ========================================
// EVENT HANDLERS
// ========================================
let dragHasMoved = false;

const handleMouseMove = (e) => {
  // ── Left-drag: pan the camera ───────────────────────────────────
  if (isDragging) {
    dragHasMoved = true;
    camera.x += e.clientX - lastMousePos.x;
    camera.y += e.clientY - lastMousePos.y;
  }
  lastMousePos = { x: e.clientX, y: e.clientY };

  // Get the exact physical bounds of the canvas so CSS padding/navbars don't break tracking
  const rect = gameCanvas.value.getBoundingClientRect();
  const rawX = e.clientX - rect.left;
  const rawY = e.clientY - rect.top;

  // Convert screen pixels → world space (accounting for camera zoom + offset)
  const mouseX = (rawX - gameCanvas.value.width / 2 - camera.x) / camera.zoom;
  const mouseY = (rawY - gameCanvas.value.height / 2 - camera.y) / camera.zoom;

  const hexCoords = pixelToHex(mouseX, mouseY);
  const roundedHex = cubeRound(hexCoords);
  const targetHex = grid.getHex(roundedHex.q, roundedHex.r) || null;

  // O(1) hover update
  if (grid.getHoveredHex() !== targetHex) grid.toggleHoveredHex(targetHex);

  // ── Right-drag: extend the live drag path (neighbors only) ─────────────
  if (isRightDragging && targetHex && targetHex.type !== "obstacle") {
    const last = liveDragPath[liveDragPath.length - 1];
    const prev = liveDragPath[liveDragPath.length - 2];

    if (last && isNeighbor(last, targetHex) && targetHex !== last) {
      if (prev && targetHex === prev) {
        // Backtracking — trim the tail
        liveDragPath.pop();
      } else if (!liveDragPath.includes(targetHex)) {
        liveDragPath.push(targetHex);
        rightDragMoved = true;
      }
      grid.setPath([...liveDragPath], "drag");
    }
  }

  // Cursor feedback
  if (isDragging) gameCanvas.value.style.cursor = "grabbing";
  else if (grid.getHoveredHex()) gameCanvas.value.style.cursor = "pointer";
  else gameCanvas.value.style.cursor = "grab";
};

const handleMouseDown = (e) => {
  if (e.button === 0) {
    // LEFT — pan camera
    isDragging = true;
    dragHasMoved = false;
    if (gameCanvas.value) gameCanvas.value.style.cursor = "grabbing";
  }
  if (e.button === 2) {
    // Detect double-click HERE (between presses) — most reliable timing point
    const now = Date.now();
    isRightDoubleClick = now - lastRightDownTime < DOUBLE_CLICK_MS;
    lastRightDownTime = now;

    // Save the ALREADY-SELECTED hex as the A* origin.
    // Must use getSelectedHex() here — getHoveredHex() would save the tile
    // being double-clicked, making origin === target and producing no path.
    if (!isRightDoubleClick) {
      rightClickFirstHex = grid.getSelectedHex();
    }

    // Start potential drag-path
    isRightDragging = true;
    rightDragMoved = false;
    liveDragPath = [];
    const start = grid.getHoveredHex();
    const myFaction = getMyFaction();

    if (
      !start ||
      !start.units ||
      start.units.length === 0 ||
      start.units[0].owner !== myFaction
    )
      return;

    if (start.type !== "obstacle") {
      liveDragPath.push(start);
      grid.setPath([...liveDragPath], "drag");
    }
  }
  lastMousePos = { x: e.clientX, y: e.clientY };
};

const handleMouseUp = (e) => {
  // ── LEFT button ──────────────────────────────────────────────────
  if (e.button === 0) {
    isDragging = false;
    // Click (no drag) — clear the path
    if (!dragHasMoved) {
      grid.clearPath();
      destinationHex = null;
    }
    if (gameCanvas.value) gameCanvas.value.style.cursor = "grab";
  }

  // ── RIGHT button ─────────────────────────────────────────────────
  if (e.button === 2) {
    isRightDragging = false;

    if (rightDragMoved && liveDragPath.length > 1) {
      // ── Drag committed — emit the painted path to the server ─────────
      const socket = getGameSocket();
      const roomId = gameStore.currentRoom?.roomId;
      if (socket && roomId) {
        socket.emit("game:path_drawn", {
          roomId,
          mode: "drag",
          path: liveDragPath.map(({ q, r, s }) => ({ q, r, s })),
        });
      }
    } else {
      // ── Pure right-click (no drag) ───────────────────────────────
      const target = grid.getHoveredHex();

      if (isRightDoubleClick) {
        // DOUBLE right-click → A* from the first-clicked hex to this tile
        // We use rightClickFirstHex (saved at mousedown #1) as origin so that
        // the first click's toggleSelectedHex doesn't collapse origin === target.
        const origin = rightClickFirstHex;

        // Restore origin selection that was lost on mouseup #1
        if (origin && grid.getSelectedHex() !== origin) {
          grid.toggleSelectedHex(origin);
        }

        if (origin && target && target !== origin) {
          destinationHex = target;
          const path = findAStarPath(origin, target);
          grid.setPath(path, "astar");

          const currentRoomId = gameStore.currentRoom?.roomId;

          if (socket && currentRoomId) {
            socket.emit("game:move_units", {
              roomId: currentRoomId,
              origin: { q: origin.q, r: origin.r, s: origin.s },
              path: path
                .slice(1)
                .map((hex) => ({ q: hex.q, r: hex.r, s: hex.s })),
            });
          }
        }
      } else {
        // SINGLE right-click → select / deselect tile
        grid.toggleSelectedHex(target);
        grid.clearPath(); // clear stale path when changing selection
        destinationHex = null; // clear old destination
      }

      isRightDoubleClick = false; // always reset after consuming
    }

    liveDragPath = [];
  }
};

const handleMouseLeave = (e) => {
  isDragging = false;
  isRightDragging = false; // cancel drag path if mouse exits canvas
  liveDragPath = [];
  if (gameCanvas.value) gameCanvas.value.style.cursor = "grab";
};

const handleWheel = (e) => {
  e.preventDefault(); // prevents the whole browser from zooming

  const rect = gameCanvas.value.getBoundingClientRect();

  // Mouse position relative to the canvas element
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // World-space point currently under the mouse (before zoom changes)
  const worldX = (mouseX - gameCanvas.value.width / 2 - camera.x) / camera.zoom;
  const worldY =
    (mouseY - gameCanvas.value.height / 2 - camera.y) / camera.zoom;

  // Standard scroll behavior: scroll down (positive delta) = zoom out (-1).
  const zoomDirection = e.deltaY > 0 ? -1 : 1;

  // Using 0.02 gives you buttery smooth zooming instead of jumping massive chunks!
  const newZoom = Math.max(
    0.1,
    Math.min(5, camera.zoom + zoomDirection * 0.02),
  );

  // Shift the camera so the same world point stays pinned under the mouse cursor
  camera.x = mouseX - gameCanvas.value.width / 2 - worldX * newZoom;
  camera.y = mouseY - gameCanvas.value.height / 2 - worldY * newZoom;
  camera.zoom = newZoom;
};

// ========================================
// MAP LOADING
// ========================================
// 2. generate a perfectly symmetrical grid by looping cube constraints
const loadMap = () => {
  const boardData = gameStore.currentRoom?.board?.hexes ?? [];

  grid.hexes.clear();
  grid.selectedHex = null;
  grid.hoveredHex = null;

  boardData.forEach((hexData) => {
    const hex = new Hex(hexData);
    // Wrap any server-side unit plain objects into proper Unit class instances
    if (hexData.units && hexData.units.length > 0) {
      hex.units = hexData.units.map((u) => new Unit(u));
    }
    grid.addHex(hex);
  });
};

// ========================================
// DRAWING FUNCTIONS
// ========================================
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

// ========================================
// GAME LOOP
// ========================================
let lastRenderTime = performance.now();

const gameLoop = () => {
  if (!ctx || !gameCanvas.value) return;
  ctx.clearRect(0, 0, gameCanvas.value.width, gameCanvas.value.height);

  const now = performance.now();
  const delta = now - lastRenderTime;
  lastRenderTime = now;

  for (const hex of grid.getHexes()) {
    if (hex.units && hex.units.length > 0) {
      for (const unit of hex.units) {
        unit.update(delta);
      }
    }
  }

  ctx.save();
  ctx.translate(
    gameCanvas.value.width / 2 + camera.x,
    gameCanvas.value.height / 2 + camera.y,
  );
  ctx.scale(camera.zoom, camera.zoom);

  const time = performance.now();

  const selectedHex = grid.getSelectedHex();
  const hoveredHex = grid.getHoveredHex();

  const gc = gameColors.value;

  // 1. Draw the base map first (skip selected, hovered, and path hexes)
  for (const hex of grid.getHexes()) {
    if (hex === selectedHex || hex === hoveredHex || hex.isOnPath) continue;

    const pixel = hexToPixel(hex.q, hex.r, hexSize);
    drawHex(
      ctx,
      pixel,
      hexSize - 1,
      hex.getRenderColor(gc),
      hex.getStrokeColor(gc),
    );
  }

  // 1.5 — Path hexes (above base map, below hover/selected)
  const pathHexes = grid.getPath();
  for (let i = 0; i < pathHexes.length; i++) {
    const ph = pathHexes[i];
    if (ph === selectedHex || ph === hoveredHex) continue;

    const pixel = hexToPixel(ph.q, ph.r, hexSize);
    drawHex(
      ctx,
      pixel,
      hexSize - 1,
      ph.getRenderColor(gc),
      ph.getStrokeColor(gc),
    );
  }

  // 1.75 — Destination Marker and Drag tip (use theme secondary = goal/checkpoint color)
  const markerPulse = 0.6 + Math.sin(time / 300) * 0.4; // 0.2 → 1.0
  const markerHex = gc.markerFill; // e.g. '#e0b455' in dark theme

  if (destinationHex) {
    const pixel = hexToPixel(destinationHex.q, destinationHex.r, hexSize);
    drawHex(
      ctx,
      pixel,
      hexSize - 1,
      gc.toRgba(markerHex, markerPulse * 0.25),
      gc.toRgba(markerHex, markerPulse),
    );
    drawHex(
      ctx,
      pixel,
      hexSize * 0.4,
      gc.toRgba(markerHex, 0),
      gc.toRgba(markerHex, markerPulse * 0.9),
    );
  }

  if (isRightDragging && liveDragPath.length > 0) {
    const dragTip = liveDragPath[liveDragPath.length - 1];
    if (dragTip !== destinationHex) {
      const pixel = hexToPixel(dragTip.q, dragTip.r, hexSize);
      drawHex(
        ctx,
        pixel,
        hexSize - 1,
        gc.toRgba(markerHex, markerPulse * 0.2),
        gc.toRgba(markerHex, markerPulse * 0.8),
      );
      drawHex(
        ctx,
        pixel,
        hexSize * 0.4,
        gc.toRgba(markerHex, 0),
        gc.toRgba(markerHex, markerPulse * 0.85),
      );
    }
  }

  // 2. Draw Hovered Hex Second (renders on top of the map)
  if (hoveredHex && hoveredHex !== selectedHex) {
    const pixel = hexToPixel(hoveredHex.q, hoveredHex.r, hexSize);
    const renderSize =
      hexSize -
      1 +
      Math.sin(time / (150 * HEX_GRADIENT_SPEED)) * HEX_GRADIENT_AMPLITUDE; // slight pulsing scale
    drawHex(
      ctx,
      pixel,
      renderSize,
      hoveredHex.getRenderColor(gc),
      hoveredHex.getStrokeColor(gc),
    );
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
      selectedHex.getRenderColor(gc),
      selectedHex.getStrokeColor(gc),
    );

    // The physical scale bounces on Math.sin(time / 200).
    // The exact duration of one sine wave cycle is 2*PI. (400 * Math.PI = ~1256ms)
    const cycleTime = 400 * Math.PI * HEX_GRADIENT_SPEED;

    // Calculate a continuous tracker from 0.0 -> 1.0 that strictly flows outwards!
    const rhythmProgress = (time % cycleTime) / cycleTime;

    // Draw an expanding hexagonal wave! HTML5 Canvas doesn't have "hex gradients"
    // So we mathematically draw 3 layers of glowing hex borders to fake a thick wave band
    for (let i = 0; i < 3; i++) {
      let ringProgress = rhythmProgress - i * 0.15;
      if (ringProgress < 0) ringProgress += 1.0;

      const ringSize = renderSize * ringProgress;

      const edgeFade = Math.max(0, 1 - ringProgress);
      const ringGlowAlpha = (0.9 - i * 0.4) * edgeFade;

      if (ringGlowAlpha > 0 && ringSize > 0) {
        // Selection glow uses theme primary color
        const strokeGlow = gc.toRgba(gc.selectionGlow, ringGlowAlpha);
        const fillGlow = gc.toRgba(gc.selectionGlow, ringGlowAlpha * 0.65);

        drawHex(ctx, pixel, ringSize, fillGlow, strokeGlow);
      }
    }
  }

  // 4. Draw Units
  for (const hex of grid.getHexes()) {
    if (hex.units && hex.units.length > 0) {
      const unit = hex.units[0];
      const pixel = hexToPixel(unit.visualQ, unit.visualR, hexSize);
      Unit.drawOnHex(ctx, hex.units, pixel, hexSize, time, gc);
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
  /* Background is set reactively via JS watch on gameColors.background */
}

canvas {
  display: block;
}
</style>
