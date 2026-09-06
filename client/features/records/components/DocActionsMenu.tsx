"use client";

import { ViewIcon, Download01Icon, Delete01Icon } from "@hugeicons/core-free-icons";
import { RowActionsMenu } from "@/components/shared/RowActionsMenu";

export function DocActionsMenu() {
  return (
    <RowActionsMenu
      label="Document actions"
      items={[
        { label: "View Document", icon: ViewIcon },
        { label: "Download", icon: Download01Icon },
        { label: "Delete", icon: Delete01Icon, variant: "destructive" },
      ]}
    />
  );
}
