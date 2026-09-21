/**
 * Hugeicons size + stroke tokens.
 * Tiers: badge 16 · chrome/control 20 · tile 40 · empty state 32
 */
export const BADGE_ICON_SIZE = 16;
export const ICON_SIZE = 20;
export const EMPTY_ICON_SIZE = 32;
export const ICON_TILE_SIZE = 40;
export const iconTileClass = "size-10";
export const ICON_STROKE = 1.5;

/**
 * Maps a numeric size to the corresponding Tailwind size class.
 * Returns undefined for non-standard sizes so callers supply an explicit class
 * rather than silently getting no sizing.
 */
export function iconSizeClass(size: number): string | undefined {
  switch (size) {
    case BADGE_ICON_SIZE:
      return "size-4";
    case ICON_SIZE:
      return "size-5";
    case EMPTY_ICON_SIZE:
      return "size-8";
    case ICON_TILE_SIZE:
      return iconTileClass;
    default:
      return undefined;
  }
}
