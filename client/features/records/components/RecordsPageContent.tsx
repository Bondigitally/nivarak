"use client";

import { useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSearch } from "@/components/shared/table-search";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  SectionInfoButton,
  SectionTitle,
} from "@/features/dashboard/components/EmptyState";
import {
  cardTitleClass,
  dashboardCardClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { CategoryCard } from "@/features/records/components/CategoryCard";
import { DocActionsMenu } from "@/features/records/components/DocActionsMenu";
import { DocumentsTable } from "@/features/records/components/DocumentsTable";
import {
  TABS,
  DOCUMENTS,
  CATEGORIES,
  DOC_ICON_MAP,
  type TabId,
} from "@/features/records/data/records-data";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  Folder02Icon,
  ScanImageIcon,
} from "@hugeicons/core-free-icons";
import { EMPTY_ICON_SIZE, ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function DocumentsHeading({ count }: { count: number }) {
  return (
    <div className="flex min-w-0 shrink-0 items-center gap-2">
      <h2 className={cardTitleClass}>All Documents</h2>
      <span className="rounded-full bg-muted px-2 py-0.5 font-sans text-xs font-bold text-primary">
        {count}
      </span>
      <SectionInfoButton info="Every uploaded health document in one place. Search, filter, view, or download files." />
    </div>
  );
}

export function RecordsPageContent() {
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

  const search = (
    <TableSearch
      value={query}
      onChange={setQuery}
      placeholder="Search files…"
      aria-label="Search documents"
    />
  );

  const tabs = (
    <SegmentedControl
      value={activeTab}
      onChange={setActiveTab}
      options={TABS}
      ariaLabel="Document filters"
      layoutId="recordsActiveTab"
      surface="card"
      className="w-full min-w-0 md:w-fit [&_button]:min-w-0 [&_button]:flex-1 md:[&_button]:flex-none"
    />
  );

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <PageHeader
          title="Health Records"
          subtitle="Track, manage, and review your health records all in one place."
        />

        <div
          role="region"
          aria-label="Upload health records"
          className={cn(
            dashboardCardClass,
            "flex min-h-45 w-full flex-col items-center justify-center gap-3 border border-dashed border-primary/25 px-5 py-6 shadow-none",
          )}
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-primary">
            <HugeiconsIcon
              icon={CloudUploadIcon}
              size={EMPTY_ICON_SIZE}
              strokeWidth={ICON_STROKE}
              color="currentColor"
              absoluteStrokeWidth
            />
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
              <HugeiconsIcon
                icon={Folder02Icon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
                absoluteStrokeWidth
              />
              Browse Files
            </Button>
            <Button
              type="button"
              variant="primary-outline"
              className={cn(typo.button, "[&_svg]:size-5")}
            >
              <HugeiconsIcon
                icon={ScanImageIcon}
                size={ICON_SIZE}
                strokeWidth={ICON_STROKE}
                color="currentColor"
                absoluteStrokeWidth
              />
              Scan
            </Button>
          </div>
        </div>

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

        <div
          className={cn(
            dashboardCardClass,
            "flex flex-col items-stretch justify-start self-stretch overflow-hidden",
          )}
        >
          <div className="flex flex-col gap-3 px-5 pt-5 pb-3 lg:hidden">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <DocumentsHeading count={filteredDocuments.length} />
              {search}
            </div>
            {tabs}
          </div>

          <div className="overflow-hidden self-stretch px-5 pt-2 pb-2 lg:hidden">
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
              <ul className="flex flex-col">
                {filteredDocuments.map((doc) => {
                  const { icon, bg, color } = DOC_ICON_MAP[doc.type];
                  return (
                    <li
                      key={doc.id}
                      className="flex items-start gap-3 border-b border-divider py-3 first:pt-1 last:border-b-0"
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-sm",
                          bg,
                        )}
                      >
                        <HugeiconsIcon
                          icon={icon}
                          size={ICON_SIZE}
                          strokeWidth={ICON_STROKE}
                          color={color}
                          absoluteStrokeWidth
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-sm font-medium leading-5 text-foreground">
                          {doc.name}
                        </p>
                        <p className="mt-1 font-sans text-sm font-normal leading-5 text-muted-foreground">
                          <span>{doc.date}</span>
                          <span
                            className="mx-1.5 text-tertiary-foreground"
                            aria-hidden
                          >
                            ·
                          </span>
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
                    className="font-sans text-sm font-medium leading-5 text-muted-foreground outline-none transition-colors hover:text-ring"
                  >
                    Load More
                  </button>
                </li>
              </ul>
            )}
          </div>

          <div className="hidden w-full lg:block">
            <DocumentsTable
              data={filteredDocuments}
              leading={<DocumentsHeading count={filteredDocuments.length} />}
              tools={search}
              subheader={tabs}
            />
          </div>
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
