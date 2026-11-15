"use client";

import { Edit02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { RowActionsMenu } from "@/components/shared/RowActionsMenu";

export function MedicationActionsMenu({
  medicationName,
  onView,
  onEdit,
}: {
  medicationName: string;
  onView?: () => void;
  onEdit?: () => void;
}) {
  return (
    <RowActionsMenu
      label={`Actions for ${medicationName}`}
      items={[
        { label: "View details", icon: ViewIcon, onClick: onView },
        { label: "Edit", icon: Edit02Icon, onClick: onEdit },
      ]}
    />
  );
}
