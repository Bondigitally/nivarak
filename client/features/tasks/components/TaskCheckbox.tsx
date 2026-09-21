import { CheckboxIndicator } from "@/components/shared/checkbox-indicator";

export function TaskCheckbox({
  completed,
  hoverPreview = true,
}: {
  completed: boolean;
  /** Show checkmark + muted fill on row hover when incomplete. */
  hoverPreview?: boolean;
}) {
  return (
    <CheckboxIndicator
      checked={completed}
      showHoverPreview={hoverPreview}
    />
  );
}
