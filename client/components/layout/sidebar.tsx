"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Cancel01Icon,
  Logout01Icon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { roundedElegance } from "@/lib/fonts";
import { typo } from "@/lib/tokens/typography";
import type { UserRole } from "@/lib/auth/roles";
import {
  SIDEBAR_TRANSITION_MS,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  useSidebar,
} from "@/components/layout/sidebar-context";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSidebarNavForRole } from "./sidebar-nav";
import { sidebarFooterClass, sidebarHeaderClass, sidebarNavActiveSurfaceClass } from "./shell-chrome";

const SIDEBAR_NAV_BADGE_CLASS = cn(
  "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-destructive px-1",
  "text-[10px] font-semibold leading-none text-primary-foreground",
);

/** Caps badge at "9+" — two characters fit in the narrow collapsed rail pill. */
function formatBadgeCount(count: number) {
  return count > 9 ? "9+" : String(count);
}

function SidebarNavBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className={SIDEBAR_NAV_BADGE_CLASS}>{formatBadgeCount(count)}</span>
  );
}

/**
 * Route-specific aria labels for badge counts.
 * Different phrasing per route because the count means different things:
 * "unread" for notifications, "due" for tasks, "new" for leads.
 */
const NAV_BADGE_ARIA: Record<string, (count: string) => string> = {
  "/notifications": (count) => `${count} unread`,
  "/care/tasks": (count) => `${count} due`,
  "/leads": (count) => `${count} new`,
};

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar";

/** Left pad so size-11 (44px) icons center in the 56px collapsed rail: (56-44)/2 = 6px */
const COLLAPSED_ICON_INSET = "pl-1.5";

/** size-11 matches expanded nav row height (44px) for consistent hit targets */
const COLLAPSED_BTN =
  "flex size-11 shrink-0 items-center justify-center rounded-md";

/** size-10 (40px) logo image fits the 56px collapsed rail with even visual padding. */
const SIDEBAR_LOGO_PX = 40;

/** Past default tooltip offset so labels clear the rail edge */
const SIDEBAR_TOOLTIP_SIDE_OFFSET = 14;

function SidebarTooltipContent({ children }: { children: React.ReactNode }) {
  return (
    <TooltipContent
      side="right"
      align="center"
      sideOffset={SIDEBAR_TOOLTIP_SIDE_OFFSET}
      collisionPadding={12}
      className="px-3.5 py-2 text-sm leading-5"
    >
      {children}
    </TooltipContent>
  );
}

const SIDEBAR_NAV_HOVER =
  "hover:text-foreground hover:bg-accent dark:hover:bg-border";

const SIDEBAR_NAV_ACTIVE = cn(
  sidebarNavActiveSurfaceClass,
  typo.sidebarItemActive,
  "text-sidebar-active-text hover:text-sidebar-active-text",
);

const SIDEBAR_NAV_INACTIVE = typo.sidebarItem;

function SidebarLogo() {
  return (
    <Image
      src="/images/nivarak-logo.png"
      alt=""
      width={SIDEBAR_LOGO_PX}
      height={SIDEBAR_LOGO_PX}
      sizes={`${SIDEBAR_LOGO_PX}px`}
      className="size-10 max-h-10 max-w-10 shrink-0 object-contain object-center"
    />
  );
}

/** Collapsed rail — logo by default; hover reveals expand control */
function CollapsedSidebarBrand({
  homeHref,
  onExpand,
  tipsEnabled,
}: {
  homeHref: string;
  onExpand: () => void;
  tipsEnabled: boolean;
}) {
  return (
    <div className="group/logo relative size-11 shrink-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onExpand}
            className={cn(
              COLLAPSED_BTN,
              "absolute inset-0 z-10 opacity-0 transition-opacity duration-150",
              "pointer-events-none hover:bg-accent hover:text-foreground",
              "group-hover/logo:pointer-events-auto group-hover/logo:opacity-100",
            )}
          >
            <NavIcon icon={PanelRightOpenIcon} />
          </button>
        </TooltipTrigger>
        <SidebarTooltipContent>Open sidebar</SidebarTooltipContent>
      </Tooltip>
      <CollapsedTip label="Nivarak" enabled={tipsEnabled}>
        <Link
          href={homeHref}
          aria-label="Nivarak home"
          className={cn(
            COLLAPSED_BTN,
            "relative transition-opacity duration-150 group-hover/logo:pointer-events-none group-hover/logo:opacity-0",
          )}
        >
          <SidebarLogo />
        </Link>
      </CollapsedTip>
    </div>
  );
}

function NavIcon({
  icon,
  className,
}: {
  icon: IconSvgElement;
  className?: string;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={ICON_SIZE}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      color="currentColor"
      className={cn("block size-5 shrink-0", className)}
      aria-hidden
    />
  );
}

function CollapsedTip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <SidebarTooltipContent>{label}</SidebarTooltipContent>
    </Tooltip>
  );
}

function Avatar() {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
      A
    </span>
  );
}

export function AppSidebar({
  role,
  navBadges = {},
}: {
  role: UserRole;
  /** Href → count; owned by the protected shell (app/feature bridge) */
  navBadges?: Record<string, number>;
}) {
  const badgeByHref = navBadges;

  const { homeHref, sections } = getSidebarNavForRole(role);
  const {
    collapsed,
    setCollapsed,
    isDrawer,
    open: drawerOpen,
    setOpen,
    openSignOut,
  } = useSidebar();
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();
  const skipAnimRef = useRef(true);

  const railCollapsed = !isDrawer && collapsed;
  const width = railCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const tipsEnabled = railCollapsed && !isAnimating;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    if (skipAnimRef.current) {
      skipAnimRef.current = false;
      return;
    }
    if (isDrawer) return;
    const start = window.setTimeout(() => setIsAnimating(true), 0);
    const id = window.setTimeout(
      () => setIsAnimating(false),
      SIDEBAR_TRANSITION_MS,
    );
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(id);
    };
  }, [collapsed, isDrawer]);

  useEffect(() => {
    if (!isDrawer) return;
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname, isDrawer, setOpen]);

  const chrome = (
    <div
      className="group/sidebar flex h-full min-h-full flex-col bg-sidebar"
      style={{ width: SIDEBAR_WIDTH_EXPANDED }}
    >
      <div className={cn(sidebarHeaderClass, "flex items-center")}>
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center",
            railCollapsed ? COLLAPSED_ICON_INSET : "gap-1 px-2",
          )}
        >
          {railCollapsed ? (
            <CollapsedSidebarBrand
              homeHref={homeHref}
              onExpand={() => setCollapsed(false)}
              tipsEnabled={tipsEnabled}
            />
          ) : (
            <>
              <Link
                href={homeHref}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2"
                aria-label="Nivarak home"
                onClick={() => {
                  if (isDrawer) setOpen(false);
                }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center">
                  <SidebarLogo />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0">
                  <span
                    className={cn(
                      "truncate",
                      roundedElegance.className,
                      typo.logo,
                      "text-2xl leading-6 tracking-[0.08em] text-primary dark:text-[var(--primary-ui)]",
                    )}
                  >
                    nivarak
                  </span>
                  <span className={cn("truncate", typo.caption, "text-muted-foreground")}>
                    Unifying Eldercare
                  </span>
                </span>
              </Link>

              {isDrawer ? (
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  <NavIcon icon={Cancel01Icon} />
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="Close sidebar"
                      aria-expanded
                      onClick={() => setCollapsed(true)}
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <NavIcon icon={PanelRightCloseIcon} />
                    </button>
                  </TooltipTrigger>
                  <SidebarTooltipContent>Close sidebar</SidebarTooltipContent>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>

      <nav
        className={cn(
          "sidebar-nav-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto py-2",
          railCollapsed ? cn("gap-1", COLLAPSED_ICON_INSET) : "gap-2",
        )}
        aria-label="Main navigation"
      >
        {sections.map((section, idx) => (
          <div
            key={section.label}
            className={cn(
              "flex flex-col gap-0.5",
              railCollapsed ? undefined : "px-2",
              idx > 0 && "mt-2",
            )}
          >
            {!railCollapsed && (
              <div className="px-3 py-2.5">
                <span className={typo.overline}>{section.label}</span>
              </div>
            )}

            {section.items.map((item) => {
              const active = isActive(item.href);
              const badgeCount = badgeByHref[item.href] ?? 0;
              const showBadge = badgeCount > 0;
              const badgeLabel = formatBadgeCount(badgeCount);
              const badgeAria = NAV_BADGE_ARIA[item.href]?.(badgeLabel);
              const tipLabel =
                showBadge && railCollapsed && badgeAria
                  ? `${item.label} (${badgeAria})`
                  : item.label;

              return (
                <CollapsedTip
                  key={item.href}
                  label={tipLabel}
                  enabled={tipsEnabled}
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={
                      showBadge && badgeAria
                        ? `${item.label}, ${badgeAria}`
                        : undefined
                    }
                    className={cn(
                      railCollapsed
                        ? COLLAPSED_BTN
                        : "flex h-11 w-full items-center gap-3 rounded-md px-3 py-2.5",
                      "border transition-colors duration-150",
                      active
                        ? SIDEBAR_NAV_ACTIVE
                        : cn(
                            SIDEBAR_NAV_INACTIVE,
                            SIDEBAR_NAV_HOVER,
                            "border-transparent",
                          ),
                      FOCUS,
                    )}
                  >
                    <span className="relative size-5 shrink-0">
                      <NavIcon
                        icon={item.icon}
                        className={
                          active ? "text-sidebar-active-icon" : undefined
                        }
                      />
                      {showBadge && railCollapsed ? (
                        <span
                          className={cn(
                            SIDEBAR_NAV_BADGE_CLASS,
                            "pointer-events-none absolute right-0 top-0 z-10 -translate-y-1/2 translate-x-1/2",
                            "ring-2 ring-sidebar",
                          )}
                          aria-hidden
                        >
                          {badgeLabel}
                        </span>
                      ) : null}
                    </span>
                    {!railCollapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {showBadge && <SidebarNavBadge count={badgeCount} />}
                      </>
                    )}
                  </Link>
                </CollapsedTip>
              );
            })}

          </div>
        ))}
      </nav>

      <div className={sidebarFooterClass}>
        <div
          className={cn(
            "flex h-full min-h-0 items-center",
            railCollapsed ? COLLAPSED_ICON_INSET : "px-2",
          )}
        >
          {railCollapsed ? (
            <CollapsedTip label="Alex" enabled={tipsEnabled}>
              <button
                type="button"
                aria-label="Alex"
                onClick={() => setCollapsed(false)}
                className={cn(COLLAPSED_BTN, FOCUS)}
              >
                <Avatar />
              </button>
            </CollapsedTip>
          ) : (
            <div className="flex w-full min-w-0 items-center gap-2">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-none text-foreground">
                  Alex
                </p>
                <p className="mt-0.5 truncate text-xs font-normal leading-4 text-muted-foreground">
                  alex@example.com
                </p>
              </div>
              <button
                type="button"
                aria-label="Sign out"
                onClick={openSignOut}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md",
                  "text-muted-foreground hover:text-destructive",
                  FOCUS,
                )}
              >
                <NavIcon icon={Logout01Icon} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <TooltipProvider delayDuration={200}>
        <Sheet open={drawerOpen} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-(--sidebar-width) max-w-(--sidebar-width) gap-0 border-r border-sidebar-border bg-sidebar p-0 font-sans shadow-lg"
            style={
              {
                "--sidebar-width": `${SIDEBAR_WIDTH_EXPANDED}px`,
              } as CSSProperties
            }
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Main app navigation
            </SheetDescription>
            {chrome}
          </SheetContent>
        </Sheet>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="relative z-10 flex h-full min-h-full shrink-0 flex-col self-stretch overflow-hidden bg-sidebar font-sans transition-[width] duration-300 ease-out"
        style={{ width, transitionDuration: `${SIDEBAR_TRANSITION_MS}ms` }}
      >
        {chrome}
      </aside>
    </TooltipProvider>
  );
}

/** @deprecated Use AppSidebar with role="patient" */
export function Sidebar() {
  return <AppSidebar role="patient" />;
}
