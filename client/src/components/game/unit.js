const iconCache = new Map();

/**
 * Loads and tints an SVG icon for a specific team color.
 * Result is cached as an offscreen canvas for performance.
 */
function getTintedIcon(iconName, color) {
  const cacheKey = `${iconName}_${color}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey);

  // If not in cache, we start loading it (but return null for now so we don't block the loop)
  if (!iconCache.has(iconName)) {
    iconCache.set(iconName, "loading");
    const img = new Image();
    img.src = `/Images/Icons/SVG/${iconName}.svg`;
    img.onload = () => {
      // Once the base image is loaded, we can generate various tinted versions
      iconCache.set(iconName, img);
    };
  }

  const baseImg = iconCache.get(iconName);
  if (!baseImg || baseImg === "loading") return null;

  // Generate the tinted version
  const offscreen = document.createElement("canvas");
  const size = 128; // high enough res for the icons
  offscreen.width = size;
  offscreen.height = size;
  const octx = offscreen.getContext("2d");

  // Draw the icon
  octx.drawImage(baseImg, 0, 0, size, size);

  // Tint it: use source-in to replace all non-transparent pixels with the flat team color
  octx.globalCompositeOperation = "source-in";
  octx.fillStyle = color;
  octx.fillRect(0, 0, size, size);

  iconCache.set(cacheKey, offscreen);
  return offscreen;
}

export function drawUnitsOnHex(ctx, units, hexPixel, hexSize, time, gameColors) {
  if (!units || units.length === 0) return;

  const numUnits = units.length;
  const faction = units[0].owner;
  const unitColor = faction === "red" ? gameColors.redUnit : gameColors.blueUnit;

  // Use the default icon for now
  const icon = getTintedIcon("Soldier_Aimed_01", unitColor);

  const floatOffset = Math.sin(time / 400) * 3;
  const drawX = hexPixel.x;
  const drawY = hexPixel.y + floatOffset;

  const iconSize = hexSize * 1.1; // Make it fill the hex nicely

  if (icon) {
    // Draw the tinted SVG icon
    ctx.drawImage(
      icon,
      drawX - iconSize / 2,
      drawY - iconSize / 2,
      iconSize,
      iconSize,
    );
  } else {
    // Fallback while loading
    ctx.beginPath();
    ctx.arc(drawX, drawY, hexSize * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = unitColor;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  // Draw the troop count text in the bottom right of the icon
  const fontSize = Math.floor(hexSize * 0.4);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  // Position it slightly offset from the bottom right of the icon bounding box
  const textX = drawX + iconSize * 0.45;
  const textY = drawY + iconSize * 0.45;

  // Add a small dark shadow/outline for readability
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 4;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.strokeText(numUnits.toString(), textX, textY);
  
  ctx.fillText(numUnits.toString(), textX, textY);
  
  // Reset shadow for subsequent draws
  ctx.shadowBlur = 0;
}
