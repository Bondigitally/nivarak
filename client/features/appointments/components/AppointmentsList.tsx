"use client";

import { useState } from "react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { cn } from "@/lib/utils";
import { AppointmentDetailsDrawer } from "./AppointmentDetailsDrawer";
import { AppointmentRow } from "./AppointmentRow";
import type { AppointmentItem, AppointmentTab } from "../data/appointments-data";

export function AppointmentsList({
  tab,
  appointments,
}: {
  tab: AppointmentTab;
  appointments: AppointmentItem[];
}) {
  const [selected, setSelected] = useState<AppointmentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDetails(appointment: AppointmentItem) {
    setSelected(appointment);
    setDrawerOpen(true);
  }

  if (appointments.length === 0) {
    return (
      <div
        className={cn(
          dashboardCardClass,
          "flex min-h-[380px] flex-col items-center justify-center px-6 py-5",
        )}
      >
        {tab === "upcoming" ? (
          <EmptyState
            icon={Calendar03Icon}
            title="No appointments scheduled"
            body="Book a consultation with your doctor, nurse, or care coordinator. Upcoming visits will appear here."
            className="min-h-0"
          />
        ) : (
          <EmptyState
            icon={Calendar03Icon}
            title="No past appointments"
            body="Completed and cancelled visits will show up here once you have appointment history."
            className="min-h-0"
          />
        )}
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <AppointmentRow
              appointment={appointment}
              onDetailsClick={openDetails}
            />
          </li>
        ))}
      </ul>

      <AppointmentDetailsDrawer
        appointment={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
