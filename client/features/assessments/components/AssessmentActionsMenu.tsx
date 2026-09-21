"use client";

import { Pdf02Icon, ViewIcon } from "@hugeicons/core-free-icons";
import { RowActionsMenu } from "@/components/shared/RowActionsMenu";

export function AssessmentActionsMenu() {
  return (
    <RowActionsMenu
      label="Assessment actions"
      items={[
        { label: "View report", icon: ViewIcon },
        { label: "Download PDF", icon: Pdf02Icon },
      ]}
    />
  );
}
