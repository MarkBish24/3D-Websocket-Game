import { computed } from "vue";
import { useTheme } from "vuetify";

/**
 * Converts a #rrggbb hex color string to an rgba() CSS string.
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * useGameTheme — bridges Vuetify's reactive theme into the canvas renderer.
 *
 * All canvas drawing code should source colors from this composable instead of
 * hardcoding hex literals. When the theme changes, gameColors updates reactively.
 *
 * Player assignments:
 *   red  → theme.error
 *   blue → theme.primary
 */
export function useGameTheme() {
  const theme = useTheme();

  const gameColors = computed(() => {
    const c = theme.current.value.colors;
    const isDark = theme.current.value.dark;

    return {
      // ── Canvas background ──────────────────────────────
      background: c.gameBackground,

      // ── Hex tile fill / stroke (semi-transparent) ──────
      hexNormalFill:    hexToRgba(c.gameHexNormal, 0.55),
      hexNormalStroke:  hexToRgba(c.gameHexStroke,  1.0),

      // ── Obstacle tiles ─────────────────────────────────
      hexObstacleFill:   hexToRgba(c.gameHexObstacle, 0.85),
      hexObstacleStroke: hexToRgba(c.gameHexObstacle, 1.0),

      // ── Arena ring ─────────────────────────────────────
      hexRingFill:   hexToRgba(c.gameHexRing, 0.4),
      hexRingStroke: hexToRgba(c.gameHexRing, 1.0),

      // ── Special tiles ──────────────────────────────────
      // Red spawn base
      redBaseFill:   hexToRgba(c.error, 0.45),
      redBaseStroke: hexToRgba(c.error, 1.0),
      // Blue spawn base
      blueBaseFill:   hexToRgba(c.primary, 0.45),
      blueBaseStroke: hexToRgba(c.primary, 1.0),
      // Checkpoint & Goal → secondary (gold)
      goalFill:         hexToRgba(c.secondary, 0.45),
      goalStroke:       hexToRgba(c.secondary, 1.0),
      checkpointFill:   hexToRgba(c.secondary, 0.35),
      checkpointStroke: hexToRgba(c.secondary, 0.85),

      // ── Hover / selection ──────────────────────────────
      hoverFill:   isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
      hoverStroke: isDark ? "rgba(255,255,255,0.9)"  : "rgba(0,0,0,0.75)",

      // Selection glow rings (sourced from primary)
      selectionGlow: c.primary,

      // ── Path overlay ───────────────────────────────────
      // Both A* and drag paths tinted from primary
      pathAstarFill:   hexToRgba(c.primary, 0.12),
      pathAstarStroke: hexToRgba(c.primary, 0.4),
      pathDragFill:    hexToRgba(c.primary, 0.25),
      pathDragStroke:  hexToRgba(c.primary, 0.75),

      // Destination / drag-tip markers → secondary (gold/teal)
      markerFill:   c.secondary,
      markerStroke: c.secondary,

      // ── Unit tokens ────────────────────────────────────
      redUnit:  c.error,
      blueUnit: c.primary,

      // ── Helpers ────────────────────────────────────────
      isDark,
      /** Converts any theme hex color to rgba with a given alpha */
      toRgba: hexToRgba,
    };
  });

  return { gameColors };
}
