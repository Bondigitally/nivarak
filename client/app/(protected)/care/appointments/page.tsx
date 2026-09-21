"use client";

import { useMemo, useState } from "react";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardGridStackClass, dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { AppointmentsList } from "@/features/appointments/components/AppointmentsList";
import {
  getAppointmentsByTab,
  type AppointmentTab,
} from "@/features/appointments/data/appointments-data";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";

const APPOINTMENT_TABS: { id: AppointmentTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function AppointmentsPage() {
  const [tab, setTab] = useState<AppointmentTab>("upcoming");
  const appointments = useMemo(() => getAppointmentsByTab(tab), [tab]);

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Appointments"
          subtitle="Manage and track all your scheduled visits."
        />

        <div className={dashboardGridStackClass}>
          <div className="pt-2">
            <SegmentedControl
              value={tab}
              onChange={setTab}
              options={APPOINTMENT_TABS}
              ariaLabel="Appointment filters"
              layoutId="appointmentsActiveTab"
            />
          </div>
          <AppointmentsList tab={tab} appointments={appointments} />
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
