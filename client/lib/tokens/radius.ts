/**
 * Semantic radius scale — matches @theme in globals.css.
 *
 * none  0px  — square / flush edges
 * xs    6px  — chart markers, hero indicators, tiny wells
 * sm    8px  — nested rows, menu items, compact icon tiles
 * md   12px  — controls, nav chrome, inner panels, inputs
 * lg   16px  — cards, standard containers
 * xl   20px  — dialogs, modals, auth shells, hero surfaces
 * full pill  — buttons, badges, chips, avatars, search chrome
 */
export const radius = {
  none: "rounded-none",
  xs: "rounded-xs",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export type RadiusToken = keyof typeof radius;
