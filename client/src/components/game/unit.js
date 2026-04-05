export function drawUnitsOnHex(ctx, units, hexPixel, hexSize, time) {
  if (!units || units.length === 0) return;

  // For now, if there are multiple units, they likely all belong to the same team.
  // We grab the color of the first unit.
  const unitColor = units[0].owner === "red" ? "#ff4444" : "#4444ff";
  const numUnits = units.length;

  // Animate a slight floating bob effect
  const floatOffset = Math.sin(time / 400) * 3;
  const drawX = hexPixel.x;
  const drawY = hexPixel.y + floatOffset;

  // Draw the base unit token (a colored circle with a white border)
  ctx.beginPath();
  ctx.arc(drawX, drawY, hexSize * 0.45, 0, 2 * Math.PI);
  ctx.fillStyle = unitColor;
  ctx.fill();
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  // Draw the troop count text inside the token
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.floor(hexSize * 0.45)}px Arial`; // slightly smaller than the circle
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(numUnits.toString(), drawX, drawY + 1); // +1 visual offset for center alignment
}
