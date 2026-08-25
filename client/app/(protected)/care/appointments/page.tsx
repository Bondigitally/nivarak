"use client";

import { useMemo, useState } from "react";
import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { dashboardGridStackClass, dashboardPageShellClass } from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { AppointmentsList } from "@/features/appointments/components/AppointmentsList";
import {
  getAppointmentsByTab,
  type AppointmentTab,
} from "@/features/appointments/data/appointments-data";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const APPOINTMENT_TABS: { id: AppointmentTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function AppointmentsPage() {
  const data = getHomeDashboardData();
  const notificationCount = data?.notificationCount ?? 3;
  const [tab, setTab] = useState<AppointmentTab>("upcoming");

  const appointments = useMemo(() => getAppointmentsByTab(tab), [tab]);

  return (
    <DashboardPageFrame notificationCount={notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex flex-col gap-1">
          <h1 className={typo.headingXxl}>Appointments</h1>
          <p className={typo.bodyL}>Manage and track all your scheduled visits.</p>
        </div>

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
    </DashboardPageFrame>
  );
}
