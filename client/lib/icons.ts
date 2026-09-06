/** Hugeicons size + stroke tokens — badge 16, chrome 20, empty state 32. */
export const BADGE_ICON_SIZE = 16;
export const ICON_SIZE = 20;
export const EMPTY_ICON_SIZE = 32;
export const ICON_STROKE = 1.5;

export function iconSizeClass(size: number): string | undefined {
  switch (size) {
    case BADGE_ICON_SIZE:
      return "size-4";
    case ICON_SIZE:
      return "size-5";
    case EMPTY_ICON_SIZE:
      return "size-8";
    default:
      return undefined;
  }
}
