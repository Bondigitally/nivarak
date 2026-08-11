"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  ShieldCheck,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavChild = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ElementType<any>;
  href?: string;
  children?: NavChild[];
};

// ─── Navigation config ────────────────────────────────────────────────────────
// Note: icon library is lucide-react (installed); design.md specifies Hugeicons
// — swap icon imports when @hugeicons/react is added to the project.

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    icon: Home,
    href: "/protected/dashboard",
  },
  {
    label: "Health",
    icon: Heart,
    children: [
      { label: "Vitals", href: "/protected/health/vitals" },
      { label: "Risk Status", href: "/protected/health/risk" },
      { label: "Health Records", href: "/protected/health/records" },
    ],
  },
  {
    label: "Care",
    icon: ShieldCheck,
    href: "/protected/care",
  },
  {
    label: "Care Team",
    icon: Users,
    href: "/protected/care-team",
  },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const NAV_BASE =
  "flex items-center gap-3 rounded-[14px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66BCF]";
const NAV_PAD = "px-3 py-[10px]"; // 10px vertical → 44px row height with 14px line-height + padding
const NAV_INACTIVE = "text-[#5F6368] hover:bg-[#F7F5F9] hover:text-[#1A1A1A]";
const NAV_ACTIVE = "bg-[#F2EBF9] text-[#6C318E] font-medium";

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["Health"]);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const isParentActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  // In collapsed mode: auto-expand the sidebar, then open the section.
  const handleSectionClick = (label: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenSections((prev) =>
        prev.includes(label) ? prev : [...prev, label]
      );
    } else {
      setOpenSections((prev) =>
        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
      );
    }
  };

  return (
    <aside
      className={cn(
        // Layout
        "relative flex h-screen flex-col shrink-0",
        // Surface — Surface/Primary (white) + Border/Primary right edge
        "bg-white border-r border-[#E9E4ED]",
        // Smooth width transition (Motion/Normal 250ms)
        "transition-[width] duration-250 ease-in-out overflow-hidden",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ── Brand header ─────────────────────────────────────── */}
      {/* Height: 64px — aligns with typical top nav bar */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-[#E9E4ED] shrink-0",
          collapsed ? "justify-center px-3" : "gap-3 px-4"
        )}
      >
        {/* Logo mark — 32×32, radius 10px */}
        <div className="size-8 rounded-[10px] bg-[#6C318E] flex items-center justify-center shrink-0">
          <span className="text-white text-[13px] font-bold leading-none select-none">
            N
          </span>
        </div>

        {!collapsed && (
          <div className="min-w-0">
            {/* Body M Semibold */}
            <p className="text-[14px] font-semibold text-[#1A1A1A] leading-5 truncate">
              Nivarak
            </p>
            {/* Caption — Overline / mist-text */}
            <p className="text-[11px] text-[#8A8F98] leading-4 truncate">
              Caring Harmony
            </p>
          </div>
        )}
      </div>

      {/* ── Collapse / expand toggle ─────────────────────────── */}
      {/* Floating pill button overlapping the sidebar edge */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute top-13 -right-3 z-20",
          "size-6 flex items-center justify-center",
          "rounded-full bg-white border border-[#E9E4ED]",
          "text-[#8A8F98] hover:text-[#6C318E] hover:border-[#6C318E]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66BCF]"
        )}
      >
        {collapsed ? (
          <ChevronRight size={12} strokeWidth={2} />
        ) : (
          <ChevronLeft size={12} strokeWidth={2} />
        )}
      </button>

      {/* ── Main navigation ──────────────────────────────────── */}
      {/* py-3 px-2: 12px top/bottom, 8px side — items are inset from sidebar edge */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          // ── Expandable section ──────────────────────────────
          if (item.children) {
            const open = openSections.includes(item.label);
            const parentActive = isParentActive(item);

            return (
              <div key={item.label}>
                {/* Parent toggle */}
                <button
                  onClick={() => handleSectionClick(item.label)}
                  aria-expanded={!collapsed && open}
                  className={cn(
                    NAV_BASE,
                    NAV_PAD,
                    "w-full",
                    parentActive ? NAV_ACTIVE : NAV_INACTIVE,
                    collapsed && "justify-center"
                  )}
                >
                  <item.icon size={20} strokeWidth={1.5} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-[14px] leading-5">
                        {item.label}
                      </span>
                      {/* Chevron rotates on open — Motion/Normal 200ms */}
                      <ChevronDown
                        size={14}
                        strokeWidth={2}
                        className={cn(
                          "shrink-0 text-[#8A8F98] transition-transform duration-200",
                          open && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Sub-items — indented with a hairline left border */}
                {!collapsed && open && (
                  <div className="mt-1 ml-8 space-y-0.5 border-l border-[#F0EDF3] pl-2">
                    {item.children.map((child) => {
                      const active = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            NAV_BASE,
                            // Compact sub-item: 36px height (py-2 = 8px × 2 + 20px line-height)
                            "px-3 py-2",
                            "text-[13px] leading-5",
                            active ? NAV_ACTIVE : NAV_INACTIVE
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // ── Leaf nav item ───────────────────────────────────
          const active = item.href ? isActive(item.href) : false;
          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                NAV_BASE,
                NAV_PAD,
                "text-[14px] leading-5",
                active ? NAV_ACTIVE : NAV_INACTIVE,
                collapsed && "justify-center"
              )}
            >
              <item.icon size={20} strokeWidth={1.5} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Border/Divider separator ─────────────────────────── */}
      <div className="mx-2 h-px bg-[#F0EDF3]" />

      {/* ── Settings (bottom of nav, above profile) ──────────── */}
      <div className="px-2 py-2">
        <Link
          href="/protected/settings"
          className={cn(
            NAV_BASE,
            NAV_PAD,
            "text-[14px] leading-5",
            isActive("/protected/settings") ? NAV_ACTIVE : NAV_INACTIVE,
            collapsed && "justify-center"
          )}
        >
          <Settings size={20} strokeWidth={1.5} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* ── User profile footer ──────────────────────────────── */}
      {/* 64px height to match header; px-3 py-3 */}
      <div
        className={cn(
          "border-t border-[#E9E4ED] py-3 flex items-center gap-2.5 shrink-0",
          collapsed ? "justify-center px-3" : "px-3"
        )}
      >
        {/* Avatar — 32×32 full-circle, Surface/Selected bg */}
        <div className="size-8 rounded-full bg-[#F2EBF9] flex items-center justify-center shrink-0">
          <span className="text-[#6C318E] text-[12px] font-semibold leading-none select-none">
            A
          </span>
        </div>

        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              {/* Label — 13px Medium */}
              <p className="text-[13px] font-medium text-[#1A1A1A] leading-5 truncate">
                Alex
              </p>
              {/* Caption — 11px, mist-text */}
              <p className="text-[11px] text-[#8A8F98] leading-4 truncate">
                alex@example.com
              </p>
            </div>

            {/* Options button — 28×28 ghost icon */}
            <button
              aria-label="User options"
              className={cn(
                "size-7 flex items-center justify-center rounded-lg",
                "text-[#8A8F98] hover:text-[#5F6368] hover:bg-[#F7F5F9]",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A66BCF]"
              )}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
