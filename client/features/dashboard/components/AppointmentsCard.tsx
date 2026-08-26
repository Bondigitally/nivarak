"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Clock01Icon,
  UserMultiple02Icon,
  ChevronRightIcon,
} from "@hugeicons/core-free-icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  dashboardCardClass,
  dashboardCardHeaderClass,
  dashboardDividedRowClass,
  dashboardRowDividerClass,
} from "../data/dashboard-styles";
import { EmptyState, SectionTitle, ViewAllLink } from "./EmptyState";
import type { HomeAppointment } from "../data/home-data";

/**
 * List-only card in dashboard-widgets.
 * AppointmentDetailsDrawer wiring lands in restructure/appointments.
 */
export function AppointmentsCard({
  appointments,
}: {
  appointments: HomeAppointment[] | null;
}) {
  return (
    <section className={cn(dashboardCardClass, "flex h-fit shrink-0 flex-col p-5")}>
      <div className={dashboardCardHeaderClass}>
        <SectionTitle info="Scheduled visits with your doctor, nurse, or care coordinator. Open Details for time, place, and visit notes.">
          Upcoming Appointments
        </SectionTitle>
        <ViewAllLink href="/care/appointments" />
      </div>
      {appointments && appointments.length > 0 ? (
        <ul className="flex min-w-0 flex-col">
          {appointments.map((appointment, index) => (
            <li key={appointment.id} className="relative">
              {index > 0 ? (
                <div className={dashboardRowDividerClass} aria-hidden />
              ) : null}
              <div
                className={cn(
                  dashboardDividedRowClass,
                  "group -mx-2 flex min-w-0 items-center gap-2.5 px-2 py-3.5 sm:gap-3 sm:py-4",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                  <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-background px-1.5 py-1.5 transition-colors duration-150 group-hover:bg-card sm:min-w-14 sm:w-auto sm:px-2.5">
                    <span className={cn(typo.headingS, "text-[#8A8F98]")}>{appointment.month}</span>
                    <span className={cn(typo.headingXl, "text-(--primary-active)")}>
                      {appointment.day}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className={cn(typo.headingS, "truncate text-sm leading-5")}>
                      {appointment.title}
                    </p>
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#F4F9FF] text-muted-foreground">
                          <HugeiconsIcon icon={Clock01Icon} size={19} strokeWidth={1.75} color="currentColor" />
                        </span>
                        <span className={cn(typo.bodyS, "min-w-0 truncate")}>{appointment.time}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FE] text-muted-foreground">
                          <HugeiconsIcon
                            icon={UserMultiple02Icon}
                            size={19}
                            strokeWidth={1.75}
                            color="currentColor"
                          />
                        </span>
                        <span className={cn(typo.bodyS, "min-w-0 truncate")}>
                          {appointment.clinician}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Details"
                  className="h-11 shrink-0 rounded-full px-3 font-semibold text-primary hover:bg-accent hover:text-primary sm:px-5"
                  asChild
                >
                  <Link href="/care/appointments">
                    <span className="hidden sm:inline">Details</span>
                    <HugeiconsIcon
                      icon={ChevronRightIcon}
                      size={12}
                      strokeWidth={1.75}
                      color="currentColor"
                    />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Calendar03Icon}
          title="No appointments scheduled"
          body="Book a consultation with your doctor, nurse, or care coordinator. Upcoming visits will appear here."
          className="min-h-0"
        />
      )}
    </section>
  );
}
