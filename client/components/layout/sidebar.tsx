"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Cancel01Icon, Logout01Icon } from "@hugeicons/core-free-icons";
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

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar";

/** Left pad so size-11 (44px) icons center in the 56 px collapsed rail: (56-44)/2 = 6 px */
const COLLAPSED_ICON_INSET = "pl-1.5";

/** Collapsed icon-rail hit target — matches expanded nav row height (44px) */
const COLLAPSED_BTN =
  "flex size-11 shrink-0 items-center justify-center rounded-md";

const SIDEBAR_LOGO_PX = 40;

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

function NavIcon({ icon }: { icon: IconSvgElement }) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={ICON_SIZE}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth
      color="currentColor"
      className="block size-5 shrink-0"
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
      <TooltipContent side="right" align="center" className="px-3.5 py-2 text-sm leading-5">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function Avatar() {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-sidebar-accent text-xs font-semibold text-sidebar-primary">
      A
    </span>
  );
}

export function AppSidebar({ role }: { role: UserRole }) {
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
      className="flex h-full flex-col"
      style={{ width: SIDEBAR_WIDTH_EXPANDED }}
    >
      {/* ── Header ── */}
      <div className="flex h-14 min-h-14 shrink-0 items-center border-b border-divider">
        <div
          className={cn(
            "flex min-w-0 items-center",
            railCollapsed ? COLLAPSED_ICON_INSET : "w-full gap-1 px-2",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center",
              railCollapsed ? "w-11" : "w-full gap-1",
            )}
          >
            <CollapsedTip label="Nivarak" enabled={tipsEnabled}>
              <Link
                href={homeHref}
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
                  <SidebarLogo />
                </span>
                {!railCollapsed && (
                  <span className="flex min-w-0 flex-1 flex-col gap-0">
                    <span
                      className={cn(
                        "truncate",
                        roundedElegance.className,
                        typo.logo,
                        "text-2xl leading-6 tracking-[0.08em] text-foreground",
                      )}
                    >
                      nivarak
                    </span>
                    <span className={cn("truncate", typo.caption, "text-muted-foreground")}>
                      Unifying Eldercare
                    </span>
                  </span>
                )}
              </Link>
            </CollapsedTip>

            {isDrawer && !railCollapsed && (
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
                  FOCUS,
                )}
              >
                <NavIcon icon={Cancel01Icon} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto py-2",
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
            )}
          >
            {!railCollapsed && (
              <div className="px-3 py-2.5">
                <span className={typo.overline}>{section.label}</span>
              </div>
            )}

            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <CollapsedTip
                  key={item.href}
                  label={item.label}
                  enabled={tipsEnabled}
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      railCollapsed
                        ? COLLAPSED_BTN
                        : "flex h-11 w-full items-center gap-3 rounded-md px-3 py-2.5",
                      active
                        ? cn("bg-sidebar-accent", typo.sidebarItemActive)
                        : cn(typo.sidebarItem, "hover:bg-accent hover:text-foreground"),
                      "transition-colors duration-150",
                      FOCUS,
                    )}
                  >
                    <NavIcon icon={item.icon} />
                    {!railCollapsed && (
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    )}
                  </Link>
                </CollapsedTip>
              );
            })}

            {idx < sections.length - 1 && (
              <div
                className={cn(
                  "mt-2 border-b border-divider",
                  railCollapsed ? "w-11" : "mx-3",
                )}
              />
            )}
          </div>
        ))}
      </nav>

      {/* ── User profile footer ── */}
      <div className="shrink-0 border-t border-divider">
        <div className={railCollapsed ? cn("py-2", COLLAPSED_ICON_INSET) : "p-2"}>
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
            <div className="flex items-center gap-2 rounded-md p-2">
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
        className="relative z-10 flex h-full shrink-0 flex-col overflow-hidden bg-sidebar font-sans transition-[width] duration-300 ease-out"
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
