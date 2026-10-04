"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Home12Icon,
  HealthIcon,
  HealtcareIcon,
  UserMultiple02Icon,
  Settings01Icon,
  Logout01Icon,
  ChevronRightIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { roundedElegance } from "@/lib/fonts";
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

import type { UserRole } from "@/features/auth/lib/roles";

type NavChild = {
  label: string;
  href: string;
  roles?: UserRole[];
};

type NavItem = {
  label: string;
  icon: IconSvgElement;
  href?: string;
  children?: NavChild[];
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    icon: Home12Icon,
    href: "/dashboard",
  },
  {
    label: "Health",
    icon: HealthIcon,
    children: [
      { label: "Assessments", href: "/health/assessments" },
      { label: "Vitals", href: "/health/vitals" },
      { label: "Health Records", href: "/health/records" },
    ],
  },
  {
    label: "Care",
    icon: HealtcareIcon,
    children: [
      { label: "Care Plan", href: "/care/plan" },
      { label: "Medications", href: "/care/medications" },
      { label: "Tasks", href: "/care/tasks" },
      { label: "Appointments", href: "/care/appointments" },
    ],
  },
  {
    label: "Care Team",
    icon: UserMultiple02Icon,
    href: "/care-team",
  },
];

const USER_NAME = "Alex";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar";
// Idle = Text/Secondary (via typo.sidebarItem); hover = Surface/Hover + Text/Primary.
// Active = Surface/Selected + Brand/Primary (via typo.sidebarItemActive).
const NAV_IDLE = "hover:bg-accent hover:text-foreground";
const NAV_ACTIVE = "bg-sidebar-accent";
const SUBMENU_MOTION = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as const,
};
/** Chevron open/close when a section expands. */
const CHEVRON_MOTION = {
  duration: 0.24,
  ease: "easeOut" as const,
};
const CHROME = "flex shrink-0 items-center";
/** Expanded row — pairs with nav `p-2`. */
const NAV_BTN =
  "flex h-11 w-full items-center gap-2 rounded-md px-2 py-3";
/** Icon rail hit target — pairs with collapsed `w-14` (56px) + `p-1.5`. */
const COLLAPSED_BTN =
  "flex size-10 shrink-0 items-center justify-center rounded-md";
/** Left inset so a size-10 control is centered in the 56px clipped rail. */
const COLLAPSED_ICON_INSET = "pl-2"; // (56 - 40) / 2 = 8px

/**
 * Horizontal rule for the sidebar chrome.
 * `inset`: 8px gutters (40px in the 56px rail). Otherwise full-bleed.
 */
function SidebarDivider({
  collapsed,
  inset = false,
  /** Set when nested inside nav `p-2` so sizing is vs the full chrome width. */
  bleedNavPadding = false,
}: {
  collapsed: boolean;
  inset?: boolean;
  bleedNavPadding?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none shrink-0",
        inset && "px-2",
        // Collapsed: cancel chrome `pl-2` so alignment is vs the 56px viewport.
        // Expanded + nav: cancel nav `p-2` so sizing matches chrome-level dividers.
        collapsed
          ? "-ml-2 w-14"
          : bleedNavPadding
            ? "-mx-2 w-[calc(100%+1rem)]"
            : "w-full",
      )}
    >
      <div className="h-px w-full bg-border" />
    </div>
  );
}

/** Sidebar icons — Material-like: 19×19, regular stroke, stroke-rounded set. */
function NavIcon({
  icon,
  size = ICON_SIZE,
}: {
  icon: IconSvgElement;
  size?: number;
}) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      color="currentColor"
      className="block size-[19px] shrink-0"
      aria-hidden
    />
  );
}

function NavChevron({ open }: { open: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="inline-flex size-[19px] shrink-0 items-center justify-center"
      // ChevronRight: 0° = right, 90° = down when the submenu is open.
      animate={{ rotate: open ? 90 : 0 }}
      transition={reduceMotion ? { duration: 0 } : CHEVRON_MOTION}
    >
      <NavIcon icon={ChevronRightIcon} />
    </motion.span>
  );
}

function CollapsedTip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const { collapsed, setCollapsed, isDrawer, open: drawerOpen, setOpen, openSignOut } =
    useSidebar();
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();
  const skipAnimRef = useRef(true);
  // Drawer always shows the expanded chrome; desktop can collapse to the icon rail.
  const railCollapsed = !isDrawer && collapsed;
  const width = railCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;
  // Tooltips only after the rail has settled collapsed — avoids Radix mount mid-transition.
  const tipsEnabled = railCollapsed && !isAnimating;

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isParentActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  useEffect(() => {
    if (skipAnimRef.current) {
      skipAnimRef.current = false;
      return;
    }
    if (isDrawer) return;
    // Defer so we don't sync setState in the effect body (cascading-render lint).
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
    const activeParents = NAV_ITEMS.filter((item) =>
      item.children?.some(
        (child) =>
          pathname === child.href || pathname.startsWith(child.href + "/"),
      ),
    ).map((item) => item.label);
    if (activeParents.length === 0) return;
    const id = window.setTimeout(() => {
      setOpenSections((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const label of activeParents) {
          if (!next.has(label)) {
            next.add(label);
            changed = true;
          }
        }
        return changed ? [...next] : prev;
      });
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    if (!isDrawer) return;
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname, isDrawer, setOpen]);

  function toggleSection(label: string) {
    if (railCollapsed) {
      setCollapsed(false);
      setOpenSections((prev) =>
        prev.includes(label) ? prev : [...prev, label],
      );
      return;
    }
    setOpenSections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  const chrome = (
    <div
      className={cn(
        "flex h-full flex-col",
        railCollapsed ? COLLAPSED_ICON_INSET : undefined,
      )}
      style={{ width: SIDEBAR_WIDTH_EXPANDED }}
    >
      <div
        className={cn(
          CHROME,
          "h-14 min-h-14",
          railCollapsed ? "py-1.5" : "p-2",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center",
            railCollapsed ? "w-10" : "w-full gap-1",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              FOCUS,
              railCollapsed
                ? COLLAPSED_BTN
                : "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2",
            )}
            aria-label="Nivarak home"
            onClick={() => {
              if (isDrawer) setOpen(false);
            }}
          >
            <span className="flex size-10 shrink-0 items-center justify-center">
              <Image
                src="/images/nivarak-logo.png"
                alt=""
                width={40}
                height={40}
                className="size-10 object-contain"
              />
            </span>
            {!railCollapsed ? (
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
            ) : null}
          </Link>

          {isDrawer && !railCollapsed ? (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className={cn(
                FOCUS,
                "inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <NavIcon icon={Cancel01Icon} />
            </button>
          ) : null}
        </div>
      </div>

      <SidebarDivider collapsed={railCollapsed} />

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto",
          railCollapsed ? "py-1.5 pr-0" : "p-2",
        )}
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          if (item.children) {
            const parentActive = isParentActive(item);
            const sectionOpen = openSections.includes(item.label);
            const open = !railCollapsed && sectionOpen;

            return (
              <div
                key={item.label}
                className={cn(
                  "flex flex-col",
                  railCollapsed ? "w-10" : "w-full",
                )}
              >
                <CollapsedTip label={item.label} enabled={tipsEnabled}>
                  <button
                    type="button"
                    onClick={() => toggleSection(item.label)}
                    aria-expanded={open}
                    aria-label={item.label}
                    className={cn(
                      parentActive && !open
                        ? typo.sidebarItemActive
                        : typo.sidebarItem,
                      railCollapsed ? COLLAPSED_BTN : NAV_BTN,
                      parentActive && !open ? NAV_ACTIVE : NAV_IDLE,
                      FOCUS,
                    )}
                  >
                    <NavIcon icon={item.icon} />
                    {!railCollapsed ? (
                      <>
                        <span className="min-w-0 flex-1 truncate text-left">
                          {item.label}
                        </span>
                        <NavChevron open={open} />
                      </>
                    ) : null}
                  </button>
                </CollapsedTip>

                {/* Skip AnimatePresence while collapsed so width transition
                    doesn't compete with height:auto exit animations. */}
                {railCollapsed ? null : (
                  <AnimatePresence initial={false}>
                    {sectionOpen ? (
                      <motion.div
                        key={`${item.label}-submenu`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={SUBMENU_MOTION}
                        className="w-full overflow-hidden"
                      >
                        <div className="flex flex-col px-3.5 pt-2">
                          <div className="flex flex-col gap-1 border-l border-border py-0.5 pl-2.5">
                            {item.children.map((child) => {
                              const active = isActive(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    active
                                      ? typo.sidebarItemActive
                                      : typo.sidebarItem,
                                    "flex h-9 items-center rounded-md py-2 pr-2 pl-4",
                                    active ? NAV_ACTIVE : NAV_IDLE,
                                    FOCUS,
                                  )}
                                >
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                )}
              </div>
            );
          }

          const active = item.href ? isActive(item.href) : false;

          return (
            <CollapsedTip
              key={item.label}
              label={item.label}
              enabled={tipsEnabled}
            >
              <Link
                href={item.href!}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  active ? typo.sidebarItemActive : typo.sidebarItem,
                  railCollapsed ? COLLAPSED_BTN : NAV_BTN,
                  active ? NAV_ACTIVE : NAV_IDLE,
                  FOCUS,
                )}
              >
                <NavIcon icon={item.icon} />
                {!railCollapsed ? (
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                ) : null}
              </Link>
            </CollapsedTip>
          );
        })}

        <div className="flex w-full flex-col">
          <SidebarDivider
            collapsed={railCollapsed}
            inset
            bleedNavPadding
          />
          <div
            className={cn(
              "pt-2",
              railCollapsed ? "flex w-10 justify-center" : "w-full",
            )}
          >
            <CollapsedTip label="Settings" enabled={tipsEnabled}>
              <Link
                href="/settings"
                aria-label="Settings"
                aria-current={
                  isActive("/settings") ? "page" : undefined
                }
                className={cn(
                  isActive("/settings")
                    ? typo.sidebarItemActive
                    : typo.sidebarItem,
                  railCollapsed ? COLLAPSED_BTN : NAV_BTN,
                  isActive("/settings") ? NAV_ACTIVE : NAV_IDLE,
                  FOCUS,
                )}
              >
                <NavIcon icon={Settings01Icon} />
                {!railCollapsed ? (
                  <span className="min-w-0 flex-1 truncate">Settings</span>
                ) : null}
              </Link>
            </CollapsedTip>
          </div>
        </div>
      </nav>

      <SidebarDivider collapsed={railCollapsed} />

      <div
        className={cn(
          CHROME,
          "h-14 min-h-14",
          railCollapsed ? "py-1.5" : "p-2",
        )}
      >
        {railCollapsed ? (
          <CollapsedTip label={USER_NAME} enabled={tipsEnabled}>
            <button
              type="button"
              aria-label={USER_NAME}
              onClick={() => setCollapsed(false)}
              className={cn(COLLAPSED_BTN, FOCUS)}
            >
              <Avatar />
            </button>
          </CollapsedTip>
        ) : (
          <div className="flex w-full items-center gap-2 px-2">
            <Avatar />
            <div className="min-w-0 flex-1">
              <p
                className={cn("truncate", typo.sidebarItem, "text-foreground")}
              >
                {USER_NAME}
              </p>
              <p
                className={cn(
                  "truncate",
                  typo.caption,
                  "text-muted-foreground",
                )}
              >
                m@example.com
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
    <>
      <TooltipProvider delayDuration={200}>
        <aside
          className="relative z-10 flex h-full shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar font-sans transition-[width] duration-300 ease-out"
          style={{ width, transitionDuration: `${SIDEBAR_TRANSITION_MS}ms` }}
        >
          {/* Expanded chrome is always full width; outer aside clips to the icon rail when collapsed.
              Collapsed: pl-2 centers size-10 icons in the 56px viewport ((56-40)/2). */}
          {chrome}
        </aside>
      </TooltipProvider>
    </>
  );
}

function Avatar() {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-sidebar-border bg-sidebar-accent text-xs font-semibold text-sidebar-primary">
      A
    </span>
  );
}
