"use client";

import { useMemo, useRef, useState } from "react";
import { AppPageFrame } from "@/components/layout/app-page-frame";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import {
  dashboardPageShellClass,
  dashboardSearchBarClass,
  dashboardSearchBarIconClass,
} from "@/features/dashboard/data/dashboard-styles";
import { SectionInfoButton, SectionTitle } from "@/features/dashboard/components/EmptyState";
import { CategoryCard } from "@/features/records/components/CategoryCard";
import { DocActionsMenu } from "@/features/records/components/DocActionsMenu";
import {
  TABS,
  DOCUMENTS,
  CATEGORIES,
  DOC_ICON_MAP,
  type TabId,
} from "@/features/records/data/records-data";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";
import { HugeiconsIcon } from "@hugeicons/react";
import { EMPTY_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import {
  CloudUploadIcon,
  Folder02Icon,
  ScanImageIcon,
  Search01Icon,
  Cancel01Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";

export default function HealthRecordsPage() {
  const data = getHomeDashboardData();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCUMENTS.filter((doc) => {
      if (activeTab === "recent" && !doc.recent) return false;
      if (activeTab === "favorites" && !doc.favorite) return false;
      if (activeTab === "shared" && !doc.shared) return false;
      if (!q) return true;
      return doc.name.toLowerCase().includes(q);
    });
  }, [activeTab, query]);

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Health Records"
          subtitle="Track, manage, and review your health records all in one place."
        />

        {/* Upload area */}
        <div
          role="region"
          aria-label="Upload health records"
          className="flex min-h-45 w-full flex-col items-center justify-center gap-3 rounded-lg bg-card px-5 py-6"
          style={{
            border: "1px dashed #C4A9D9",
            boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.04)",
          }}
          onDragOver={(event) => event.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sidebar-accent text-primary">
            <HugeiconsIcon icon={CloudUploadIcon} size={EMPTY_ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-sans text-base font-semibold leading-6 text-foreground">
              Drag &amp; Drop files here
            </p>
            <p className={typo.caption}>
              Supported formats: PDF, JPG, PNG (Max size: 50MB per file)
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              className={cn(typo.button, "[&_svg]:size-5")}
              onClick={() => fileInputRef.current?.click()}
            >
              <HugeiconsIcon icon={Folder02Icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              Browse Files
            </Button>
            <Button
              type="button"
              variant="primary-outline"
              className={cn(typo.button, "[&_svg]:size-5")}
            >
              <HugeiconsIcon icon={ScanImageIcon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
              Scan
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <SectionTitle className="flex-none pr-0 text-foreground">
            Categories
          </SectionTitle>
          <div className="grid grid-cols-1 gap-dash-gutter md:grid-cols-2 xl:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.label} {...cat} />
            ))}
          </div>
        </div>

        {/* All Documents */}
        <div
          className="flex flex-col items-stretch justify-start self-stretch rounded-lg bg-card"
          style={{
            outline: "1px #E5E2E1 solid",
            outlineOffset: "-1px",
            boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
          }}
        >
          <div className="flex flex-col gap-dash-gutter self-stretch px-5 pt-5 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex shrink-0 items-center gap-2">
              <h2 className="font-sans text-[22px] font-semibold leading-7 text-foreground">
                All Documents
              </h2>
              <span className="rounded-full bg-sidebar-accent px-2 py-0.5 font-sans text-xs font-bold text-primary">
                {filteredDocuments.length}
              </span>
              <SectionInfoButton info="Every uploaded health document in one place. Search, filter, view, or download files." />
            </div>

            <div className="flex w-full min-w-0 items-center gap-3 lg:w-auto lg:max-w-105 lg:justify-end">
              <label
                className={cn(
                  dashboardSearchBarClass,
                  "h-11 w-full min-w-0 max-w-none flex-1 cursor-text lg:w-70 lg:flex-none",
                  !query.trim() && "pr-5"
                )}
              >
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  className={dashboardSearchBarIconClass}
                absoluteStrokeWidth />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search files…"
                  aria-label="Search documents"
                  className={cn(
                    typo.input,
                    "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
                  )}
                />
                {query.trim() ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
                  </button>
                ) : null}
              </label>
              <Button
                type="button"
                variant="secondary"
                aria-label="Filter"
                className="h-11 shrink-0 [&_svg]:size-4.75"
              >
                <HugeiconsIcon icon={FilterHorizontalIcon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color="currentColor" absoluteStrokeWidth />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>
          </div>

          <div className="min-w-0 self-stretch px-5 pb-3">
            <SegmentedControl
              value={activeTab}
              onChange={setActiveTab}
              options={TABS}
              ariaLabel="Document filters"
              layoutId="recordsActiveTab"
              className="w-full min-w-0 md:w-fit [&_button]:min-w-0 [&_button]:flex-1 md:[&_button]:flex-none"
            />
          </div>

          <div className="overflow-hidden self-stretch rounded-b-xl px-5 pt-2 pb-2">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
                <p className="font-sans text-sm font-medium leading-5 text-foreground">
                  No documents found
                </p>
                <p className="font-sans text-sm font-normal leading-5 text-muted-foreground">
                  Try a different search or filter.
                </p>
              </div>
            ) : (
              <>
                <ul className="flex flex-col lg:hidden">
                  {filteredDocuments.map((doc) => {
                    const { icon, bg, color } = DOC_ICON_MAP[doc.type];
                    return (
                      <li
                        key={doc.id}
                        className="flex items-start gap-3 border-b border-divider py-3 first:pt-1 last:border-b-0"
                      >
                        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-sm", bg)}>
                          <HugeiconsIcon icon={icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} absoluteStrokeWidth />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-sm font-medium leading-5 text-foreground">{doc.name}</p>
                          <p className="mt-1 font-sans text-sm font-normal leading-5 text-muted-foreground">
                            <span>{doc.date}</span>
                            <span className="mx-1.5 text-tertiary-foreground" aria-hidden>·</span>
                            <span>{doc.size}</span>
                          </p>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          <DocActionsMenu />
                        </div>
                      </li>
                    );
                  })}
                  <li className="py-3 text-center">
                    <button
                      type="button"
                      className="font-sans text-sm font-medium leading-5 text-muted-foreground outline-none transition-colors hover:text-primary"
                    >
                      Load More
                    </button>
                  </li>
                </ul>

                <div className="horizontal-scroll-stable hidden w-full lg:block">
                  <table className="w-full min-w-160 table-fixed border-separate border-spacing-0">
                    <colgroup>
                      <col />
                      <col className="w-40" />
                      <col className="w-28" />
                      <col className="w-14" />
                    </colgroup>
                    <thead>
                      <tr className="bg-table-header">
                        <th scope="col" className="h-11 rounded-l-xl px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-muted-foreground whitespace-nowrap">
                          Document Name
                        </th>
                        <th scope="col" className="h-11 px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-muted-foreground whitespace-nowrap">
                          Date
                        </th>
                        <th scope="col" className="h-11 px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-muted-foreground whitespace-nowrap">
                          Size
                        </th>
                        <th scope="col" className="h-11 w-14 rounded-r-xl px-2">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc) => {
                        const { icon, bg, color } = DOC_ICON_MAP[doc.type];
                        return (
                          <tr key={doc.id} className="transition-colors duration-100 hover:bg-accent">
                            <td className="border-b border-divider px-4 py-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-sm", bg)}>
                                  <HugeiconsIcon icon={icon} size={ICON_SIZE} strokeWidth={ICON_STROKE} color={color} absoluteStrokeWidth />
                                </div>
                                <span className="truncate font-sans text-sm font-medium leading-5 text-foreground">
                                  {doc.name}
                                </span>
                              </div>
                            </td>
                            <td className="border-b border-divider px-4 py-3 font-sans text-sm font-normal leading-5 text-muted-foreground whitespace-nowrap">
                              {doc.date}
                            </td>
                            <td className="border-b border-divider px-4 py-3 font-sans text-sm font-normal leading-5 text-muted-foreground whitespace-nowrap">
                              {doc.size}
                            </td>
                            <td className="w-14 border-b border-divider px-2 py-3 text-right">
                              <DocActionsMenu />
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="transition-colors duration-100 hover:bg-accent">
                        <td colSpan={4} className="px-4 py-3 text-center">
                          <button
                            type="button"
                            className="font-sans text-sm font-medium leading-5 text-muted-foreground outline-none transition-colors hover:text-primary"
                          >
                            Load More
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
