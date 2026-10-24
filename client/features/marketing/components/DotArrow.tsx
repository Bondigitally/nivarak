import { cn } from "@/lib/utils";
import "@/features/marketing/components/dot-arrow.css";

/**
 * Right-pointing arrow built only from circular dots.
 *
 * Grid (x → right, y → down; origin = leftmost shaft on centerline):
 *   Shaft: (0–4, 0)
 *   Head base: (5, -2…2)
 *   Head mid:  (6, -1…1)
 *   Tip:       (7, 0)
 *
 * One shared cycle: lit window slides left→right (tail leads, tip trails),
 * then an empty hold before the loop.
 * Reduced motion is handled in CSS (`prefers-reduced-motion`) — no JS motion lib.
 */
const DOTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 4, y: 0 },
  { x: 5, y: -2 },
  { x: 5, y: -1 },
  { x: 5, y: 0 },
  { x: 5, y: 1 },
  { x: 5, y: 2 },
  { x: 6, y: -1 },
  { x: 6, y: 0 },
  { x: 6, y: 1 },
  { x: 7, y: 0 },
];

const MAX_ABS_Y = 2;

/** Default cycle length (seconds). Action ≈ 65%, empty hold ≈ 35%. */
export const DOT_ARROW_DURATION_S = 1.85;

type DotArrowProps = {
  /** `right` default; `down` rotates the same timeline 90°. */
  direction?: "right" | "down";
  className?: string;
  /** Override cycle length (seconds). */
  duration?: number;
};

export function DotArrow({
  direction = "right",
  className,
  duration = DOT_ARROW_DURATION_S,
}: DotArrowProps) {
  return (
    <span
      className={cn(
        "dot-arrow",
        direction === "down" && "dot-arrow-down",
        className,
      )}
      style={{ ["--dot-arrow-duration" as string]: `${duration}s` }}
      aria-hidden="true"
    >
      <span className="dot-arrow-stage">
        {DOTS.map((dot) => (
          <span
            key={`${dot.x}-${dot.y}`}
            className={cn("dot-arrow-dot", `dot-arrow-col-${dot.x}`)}
            style={{
              ["--dot-x" as string]: dot.x,
              ["--dot-y" as string]: dot.y,
              ["--max-y" as string]: MAX_ABS_Y,
            }}
          />
        ))}
      </span>
    </span>
  );
}
