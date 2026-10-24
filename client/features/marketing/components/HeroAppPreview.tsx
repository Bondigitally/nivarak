"use client";

/**
 * Static patient-app preview for the marketing hero.
 * Shared shell + all screen bodies mounted up front (smooth CSS slides).
 *
 * Performance notes:
 * - Care-team avatars use initials only (avoids decoding ~1MB of PNGs).
 * - Screen switches use CSS, not framer-motion (smaller JS, less main-thread work).
 * - All panels mount behind the site loader so next/prev never mounts mid-transition.
 */

import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  CalendarAdd01Icon,
  Logout01Icon,
  Notification01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { markAnimatedOnce } from "@/components/ui/use-once-animation";
import {
  SIDEBAR_WIDTH_EXPANDED,
  SidebarProvider,
} from "@/components/layout/sidebar-context";
import { PATIENT_NAV } from "@/components/layout/sidebar-nav";
import {
  sidebarFooterClass,
  sidebarHeaderClass,
  sidebarNavActiveSurfaceClass,
} from "@/components/layout/shell-chrome";
import { PageHeader } from "@/components/shared/PageHeader";
import { AppointmentRow } from "@/features/appointments/components/AppointmentRow";
import { getAppointmentsByTab } from "@/features/appointments/data/appointments-data";
import { RecentAssessmentsTable } from "@/features/assessments/components/RecentAssessmentsTable";
import { ASSESSMENT_ROWS } from "@/features/assessments/data/assessments-data";
import { AppointmentsCard } from "@/features/appointments/components/AppointmentsCard";
import { CareTeamCard } from "@/features/dashboard/components/CareTeamCard";
import { HomeGreeting } from "@/features/dashboard/components/HomeGreeting";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import { RecentActivityCard } from "@/features/dashboard/components/RecentActivityCard";
import { RiskStatusCard } from "@/features/dashboard/components/RiskStatusCard";
import { VitalsCard } from "@/features/dashboard/components/VitalsCard";
import {
  dashboardGridStackClass,
  dashboardPageShellClass,
  dashboardSearchBarClass,
  dashboardSearchBarIconClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { TasksCard } from "@/features/tasks/components/TasksCard";
import { roundedElegance } from "@/lib/fonts";
import { BADGE_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import {
  dashboardHeaderIconButtonClass,
  dashboardSearchBarPlaceholderClass,
} from "@/lib/tokens/page-shell";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export type HeroAppScreen = "dashboard" | "assessments" | "appointments";

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = DESIGN_WIDTH * (1024 / 1440);

const SCREEN_ORDER: HeroAppScreen[] = [
  "dashboard",
  "assessments",
  "appointments",
];

const SCREEN_HREF: Record<HeroAppScreen, string> = {
  dashboard: "/dashboard",
  assessments: "/health/assessments",
  appointments: "/care/appointments",
};

const NAV_BADGES: Record<string, number> = {
  "/care/tasks": 7,
  "/notifications": 5,
};

const SIDEBAR_NAV_ACTIVE = cn(
  sidebarNavActiveSurfaceClass,
  typo.sidebarItemActive,
  "text-sidebar-active-text hover:text-sidebar-active-text",
);

const SIDEBAR_NAV_INACTIVE = typo.sidebarItem;

const SIDEBAR_NAV_BADGE_CLASS = cn(
  "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-destructive px-1",
  "text-[10px] font-semibold leading-none text-primary-foreground",
);

const PAGE_SHELL = cn(
  dashboardPageShellClass,
  "!gap-3 !px-4 !pt-3 !pb-4",
);

const HOME_DATA = getHomeDashboardData();
const PREVIEW_APPOINTMENTS = getAppointmentsByTab("upcoming").slice(0, 3);

/** Initials-only — skips decoding large care-team PNGs in the hero. */
const PREVIEW_CARE_TEAM =
  HOME_DATA.careTeam?.map(({ imageSrc, ...member }) => {
    void imageSrc;
    return member;
  }) ?? null;

markAnimatedOnce(`ias-score-ring:${HOME_DATA.assessment?.score ?? 79}`);
markAnimatedOnce("dashboard-vitals-bp");
markAnimatedOnce("dashboard-vitals-hr");
markAnimatedOnce("dashboard-risk-radar");

const StaticSidebar = memo(function StaticSidebar({
  activeHref,
}: {
  activeHref: string;
}) {
  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar font-sans"
      style={{ width: SIDEBAR_WIDTH_EXPANDED }}
    >
      <div className={cn(sidebarHeaderClass, "flex items-center gap-2 px-3")}>
        <span className="flex size-10 shrink-0 items-center justify-center">
          <Image
            src="/images/nivarak-logo.png"
            alt=""
            width={40}
            height={40}
            className="size-10 max-h-10 max-w-10 object-contain object-center"
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0">
          <span
            className={cn(
              "truncate",
              roundedElegance.className,
              typo.logo,
              "text-2xl leading-6 tracking-[0.08em]",
            )}
          >
            nivarak
          </span>
          <span className={cn("truncate", typo.caption, "text-muted-foreground")}>
            Unifying Eldercare
          </span>
        </span>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-2"
        aria-label="Main navigation"
      >
        {PATIENT_NAV.sections.map((section, idx) => (
          <div
            key={section.label}
            className={cn("flex flex-col gap-0.5", idx > 0 && "mt-2")}
          >
            <div className="px-3 py-2.5">
              <span className={typo.overline}>{section.label}</span>
            </div>
            {section.items.map((item) => {
              const active = item.href === activeHref;
              const badge = NAV_BADGES[item.href];
              return (
                <span
                  key={item.href}
                  className={cn(
                    "flex h-11 w-full items-center gap-3 rounded-md border px-3 py-2.5",
                    "transition-[background-color,border-color,color,box-shadow] duration-[420ms] ease-[var(--ease-out)]",
                    "motion-reduce:transition-none",
                    active
                      ? SIDEBAR_NAV_ACTIVE
                      : cn(SIDEBAR_NAV_INACTIVE, "border-transparent"),
                  )}
                >
                  <span className="relative size-5 shrink-0">
                    <HugeiconsIcon
                      icon={item.icon}
                      size={ICON_SIZE}
                      strokeWidth={ICON_STROKE}
                      color="currentColor"
                      absoluteStrokeWidth
                      className={cn(
                        "block size-5 shrink-0",
                        active && "text-sidebar-active-icon",
                      )}
                      aria-hidden
                    />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badge != null ? (
                    <span className={SIDEBAR_NAV_BADGE_CLASS}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={cn(sidebarFooterClass, "flex items-center px-2")}>
        <div className="flex w-full min-w-0 items-center gap-2">
          <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
            A
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-none text-foreground">
              Alex
            </p>
            <p className="mt-0.5 truncate text-xs font-normal leading-4 text-muted-foreground">
              alex@example.com
            </p>
          </div>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground">
            <HugeiconsIcon
              icon={Logout01Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              absoluteStrokeWidth
              className="block size-5 shrink-0"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </aside>
  );
});

const StaticTopBar = memo(function StaticTopBar() {
  return (
    <header className="flex w-full shrink-0 items-center gap-3 border-b border-transparent bg-background px-6 py-3">
      <div className="flex min-w-0 flex-1" />
      <div className={cn(dashboardSearchBarClass, "max-w-md")}>
        <HugeiconsIcon
          icon={Search01Icon}
          size={ICON_SIZE}
          strokeWidth={ICON_STROKE}
          color="currentColor"
          absoluteStrokeWidth
          className={dashboardSearchBarIconClass}
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            dashboardSearchBarPlaceholderClass,
          )}
        >
          Search patients, vitals, reports...
        </span>
        <span className="rounded-md bg-accent px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          ⌘K
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
          <HugeiconsIcon
            icon={CalendarAdd01Icon}
            size={BADGE_ICON_SIZE}
            strokeWidth={ICON_STROKE}
            color="currentColor"
            absoluteStrokeWidth
          />
          Book Appointment
        </span>
        <span
          className={cn(
            dashboardHeaderIconButtonClass,
            "inline-flex size-9 items-center justify-center rounded-full",
          )}
        >
          <span className="relative inline-flex">
            <HugeiconsIcon
              icon={Notification01Icon}
              size={ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              absoluteStrokeWidth
            />
            <span className="absolute top-0 right-0 size-2 rounded-full bg-destructive ring-2 ring-card" />
          </span>
        </span>
      </div>
    </header>
  );
});

const StaticDashboardBody = memo(function StaticDashboardBody() {
  return (
    <div className={PAGE_SHELL}>
      <HomeGreeting
        name={HOME_DATA.greetingName}
        subtitle={HOME_DATA.greetingSubtitle}
      />
      <IasScoreCard assessment={HOME_DATA.assessment} layout="desktop" />
      <div className="grid w-full min-w-0 grid-cols-12 items-stretch gap-3">
        <div className="col-span-6 flex min-h-0 min-w-0">
          <VitalsCard vitals={HOME_DATA.vitals} />
        </div>
        <div className={cn("col-span-6 min-w-0", dashboardGridStackClass, "!gap-3")}>
          <RiskStatusCard risk={HOME_DATA.risk} />
          <AppointmentsCard appointments={HOME_DATA.appointments} />
        </div>
        <div className="col-span-4 min-w-0">
          <TasksCard />
        </div>
        <div className="col-span-4 min-w-0">
          <CareTeamCard members={PREVIEW_CARE_TEAM} />
        </div>
        <div className="col-span-4 min-w-0">
          <RecentActivityCard items={HOME_DATA.activity} />
        </div>
      </div>
    </div>
  );
});

const StaticAssessmentsBody = memo(function StaticAssessmentsBody() {
  const assessment = HOME_DATA.assessment;
  if (!assessment) return null;

  return (
    <div className={PAGE_SHELL}>
      <PageHeader
        title="Assessments"
        subtitle="Review your completed health assessments and monitor your progress over time."
      />
      <div className="flex flex-col gap-3">
        <IasScoreCard assessment={assessment} variant="plain" layout="desktop" />
        <RecentAssessmentsTable data={ASSESSMENT_ROWS} />
      </div>
    </div>
  );
});

const StaticAppointmentsBody = memo(function StaticAppointmentsBody() {
  return (
    <div className={PAGE_SHELL}>
      <PageHeader
        title="Appointments"
        subtitle="Manage and track all your scheduled visits."
      />
      <div className={cn(dashboardGridStackClass, "!gap-3")}>
        <div className="pt-1">
          <div className="relative flex h-11 w-fit items-stretch">
            <span
              className={cn(
                radius.md,
                "pointer-events-none absolute top-1/2 right-0 left-0 z-0 h-10 -translate-y-1/2 bg-table-header",
              )}
            />
            <span
              className={cn(
                radius.md,
                "relative z-10 flex h-full items-center justify-center border border-border bg-card px-5 text-sm font-medium leading-5 text-foreground shadow-[0_1px_2px_rgba(17,24,39,0.06)]",
              )}
            >
              Upcoming
            </span>
            <span className="relative z-10 flex h-full items-center justify-center px-5 text-sm leading-5 text-muted-foreground">
              Past
            </span>
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          {PREVIEW_APPOINTMENTS.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentRow
                appointment={appointment}
                onDetailsClick={() => {}}
                layout="desktop"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

const SCREEN_BODIES: Record<HeroAppScreen, () => ReactNode> = {
  dashboard: () => <StaticDashboardBody />,
  assessments: () => <StaticAssessmentsBody />,
  appointments: () => <StaticAppointmentsBody />,
};

/** Match carousel lock so nav doesn’t stack mid-slide. */
export const HERO_PREVIEW_SLIDE_MS = 650;

export function HeroAppPreview({
  screen,
  onReady,
}: {
  screen: HeroAppScreen;
  /** Fires once after scale + full dashboard have painted (reveal all at once). */
  onReady?: () => void;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const readySentRef = useRef(false);
  const [scale, setScale] = useState(0.5);
  const [scaled, setScaled] = useState(false);
  const activeIdx = SCREEN_ORDER.indexOf(screen);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const sync = () => {
      const width = shell.clientWidth;
      if (width <= 0) return;
      setScale(width / DESIGN_WIDTH);
      setScaled(true);
    };
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(shell);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!scaled || readySentRef.current) return;

    // Two frames + short settle so layout/Recharts finish behind the loader,
    // then the parent reveals the complete screen in one fade.
    let outer = 0;
    let inner = 0;
    let settle = 0;
    outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        settle = window.setTimeout(() => {
          if (readySentRef.current) return;
          readySentRef.current = true;
          onReadyRef.current?.();
        }, 80);
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      window.clearTimeout(settle);
    };
  }, [scaled]);

  return (
    <div
      ref={shellRef}
      className="pointer-events-none relative size-full select-none overflow-hidden bg-background"
      aria-hidden
    >
      <SidebarProvider>
        <div
          className="absolute top-0 left-0 flex overflow-hidden bg-background"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <StaticSidebar activeHref={SCREEN_HREF[screen]} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <StaticTopBar />
            {/*
              Single-track slide: one translate3d on the strip (not per-panel
              opacity/transform). Percentages resolve against the track’s
              definite width (= viewport), so -100% == one screen.
            */}
            <div className="relative min-h-0 w-full flex-1 overflow-hidden">
              <div
                className={cn(
                  "flex h-full w-full transform-gpu will-change-transform",
                  "transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "motion-reduce:transition-none",
                )}
                style={{
                  transform: `translate3d(-${activeIdx * 100}%, 0, 0)`,
                }}
              >
                {SCREEN_ORDER.map((panel) => (
                  <div
                    key={panel}
                    className="h-full w-full min-w-full shrink-0 grow-0 basis-full overflow-hidden [contain:layout_paint]"
                    aria-hidden={panel !== screen}
                  >
                    {SCREEN_BODIES[panel]()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
