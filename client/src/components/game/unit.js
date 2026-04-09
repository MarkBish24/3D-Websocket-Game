class Unit {
  constructor(data) {
    // server data/position
    this.q = data.q;
    this.r = data.r;
    this.s = data.s;
    this.owner = data.owner;

    // visual position
    this.visualQ = this.q;
    this.visualR = this.r;
    this.visualS = this.s;

    // animation state
    this.prevQ = this.q;
    this.prevR = this.r;
    this.prevS = this.s;
    this.lerpProgress = 1.0;

    this.iconName = "Soldier_Aimed_01";
  }

  update(delta) {
    if (this.lerpProgress < 1.0) {
      this.lerpProgress = Math.min(1.0, this.lerpProgress + delta / 500);
      const t = this.smoothstep(this.lerpProgress);
      this.visualQ = this.prevQ + (this.q - this.prevQ) * t;
      this.visualR = this.prevR + (this.r - this.prevR) * t;
      this.visualS = this.prevS + (this.s - this.prevS) * t;
    }
  }

  smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  updateFromServer(serverUnit) {
    if (
      serverUnit.q !== this.q ||
      serverUnit.r !== this.r ||
      serverUnit.s !== this.s
    ) {
      this.prevQ = this.visualQ;
      this.prevR = this.visualR;
      this.prevS = this.visualS;
      this.lerpProgress = 0.0;

      this.q = serverUnit.q;
      this.r = serverUnit.r;
      this.s = serverUnit.s;
    }
  }

  draw(ctx, hexPixel, hexSize, time, gameColors) {
    const unitColor =
      this.owner === "red" ? gameColors.redUnit : gameColors.greenUnit;
    const icon = Unit.getTintedIcon(this.iconName, unitColor);

    const floatOffset = Math.sin(time / 400) * 3;
    const drawX = hexPixel.x;
    const drawY = hexPixel.y + floatOffset;
    const iconSize = hexSize * 1.1;

    if (icon) {
      ctx.shadowColor = gameColors.unitShadow;
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;
      ctx.drawImage(
        icon,
        drawX - iconSize / 2,
        drawY - iconSize / 2,
        iconSize,
        iconSize,
      );
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.beginPath();
      ctx.arc(drawX, drawY, hexSize * 0.4, 0, 2 * Math.PI);
      ctx.fillStyle = unitColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  }

  static drawOnHex(ctx, units, hexPixel, hexSize, time, gameColors) {
    if (!units || units.length === 0) return;

    units[0].draw(ctx, hexPixel, hexSize, time, gameColors);

    const numUnits = units.length;
    const iconSize = hexSize * 1.1;
    const floatOffset = Math.sin(time / 400) * 3;
    const drawX = hexPixel.x;
    const drawY = hexPixel.y + floatOffset;

    const fontSize = Math.floor(hexSize * 0.4);
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";

    const textX = drawX + iconSize * 0.45;
    const textY = drawY + iconSize * 0.45;

    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 4;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeText(numUnits.toString(), textX, textY);
    ctx.fillText(numUnits.toString(), textX, textY);
    ctx.shadowBlur = 0;
  }

  static getTintedIcon(iconName, color) {
    const cacheKey = `${iconName}_${color}`;
    if (Unit.iconCache.has(cacheKey)) return Unit.iconCache.get(cacheKey);

    if (!Unit.iconCache.has(iconName)) {
      Unit.iconCache.set(iconName, "loading");
      const img = new Image();
      img.src = `/Images/Icons/SVG/${iconName}.svg`;
      img.onload = () => {
        Unit.iconCache.set(iconName, img);
        for (const key of Unit.iconCache.keys()) {
          if (key.startsWith(`${iconName}_`)) Unit.iconCache.delete(key);
        }
      };
    }

    const baseImg = Unit.iconCache.get(iconName);
    if (!baseImg || baseImg === "loading") return null;

    const offscreen = document.createElement("canvas");
    offscreen.width = 128;
    offscreen.height = 128;
    const octx = offscreen.getContext("2d");
    octx.drawImage(baseImg, 0, 0, 128, 128);
    octx.globalCompositeOperation = "source-in";
    octx.fillStyle = color;
    octx.fillRect(0, 0, 128, 128);

    Unit.iconCache.set(cacheKey, offscreen);
    return offscreen;
  }
}

Unit.iconCache = new Map();

export { Unit };
