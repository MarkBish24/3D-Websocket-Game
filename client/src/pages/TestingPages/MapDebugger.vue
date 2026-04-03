<template>
  <div class="debugger-container">
    <div class="controls">
      <h1>Map Debugger</h1>
      <p>Fine-tune Double Perlin generation</p>

      <label>Macro Scale: {{ scale }}</label>
      <input type="range" min="0.05" max="0.30" step="0.01" v-model.number="scale" @change="regenerateMap" />
      
      <label>Erosion Treshold: {{ threshold }}</label>
      <input type="range" min="0.5" max="1.5" step="0.05" v-model.number="threshold" @change="regenerateMap" />
      
      <label>Zoom Size: {{ zoom }}</label>
      <input type="range" min="5" max="40" step="1" v-model.number="zoom" @input="drawMap" />

      <button style="margin-top: 15px;" @click="regenerateMap">Force Re-Roll</button>
    </div>
    
    <div class="viewer">
      <canvas id="debuggerCanvas" ref="mapCanvas" :width="800" :height="800"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HexGrid as ServerHexGrid } from "../../../../server/game/entities/HexGrid.js";
import { Hex as ClientHex } from "../../components/game/hex.js";

const mapCanvas = ref(null);
const ctx = ref(null);
const grid = new ServerHexGrid();

const scale = ref(0.1);
const threshold = ref(0.8);
const zoom = ref(18);

// Instead of making a network request, we literally just run the game server math right here!
const regenerateMap = () => {
  grid.generateGrid({ scale: scale.value, threshold: threshold.value });
  drawMap();
};

const drawMap = () => {
    if (!ctx.value) return;
    const canvas = mapCanvas.value;
    ctx.value.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.value.save();
    ctx.value.translate(canvas.width / 2, canvas.height / 2);
    
    // Simplified Canvas Looper
    for (const serverHex of grid.hexes.values()) {
        // Convert pure math server Hex into a visual Client Hex to access getRenderColor()
        const clientHex = new ClientHex(serverHex);
        
        const pixel = hexToPixel(clientHex.q, clientHex.r, zoom.value);
        // The physical drawn radius is the spacing minus 1 to create the nice grid lines
        const drawRadius = Math.max(1, zoom.value - 1); 
        drawSimpleHex(ctx.value, pixel, drawRadius, clientHex.getRenderColor(), clientHex.getStrokeColor());
    }
    ctx.value.restore();
}

const hexToPixel = (q, r, size) => {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * (3 / 2) * r;
  return { x, y };
};

const drawSimpleHex = (context, center, size, color, strokeColor) => {
  context.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle_deg = 60 * i - 30;
    const angle_rad = (Math.PI / 180) * angle_deg;
    const x = center.x + size * Math.cos(angle_rad);
    const y = center.y + size * Math.sin(angle_rad);
    if (i === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = strokeColor;
  context.lineWidth = 1;
  context.stroke();
};

onMounted(() => {
  ctx.value = mapCanvas.value.getContext("2d");
  regenerateMap();
});
</script>

<style scoped>
.debugger-container { 
  display: flex; gap: 40px; padding: 20px; 
  background-color: #111; color: white; min-height: 100vh;
}
.controls { 
  display: flex; flex-direction: column; gap: 10px; width: 300px; 
}
input[type=range] { width: 100%; cursor: pointer;}
.viewer canvas {
    background-color: #1a1a1a;
    border-radius: 8px;
}
</style>
