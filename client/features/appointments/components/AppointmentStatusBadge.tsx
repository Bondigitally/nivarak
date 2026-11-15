import { statusBadgeClass } from "@/features/dashboard/data/dashboard-styles";
import { cn } from "@/lib/utils";
import {
  appointmentStatusBadgeStyles,
  type AppointmentStatus,
} from "../data/appointments-data";

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const { dotClassName, label } = appointmentStatusBadgeStyles[status];

  return (
    <span
      className={cn(
        statusBadgeClass,
        "shrink-0 gap-1.5 border border-border bg-muted text-foreground",
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", dotClassName)}
        aria-hidden
      />
      {label}
    </span>
  );
}
