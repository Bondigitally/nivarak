"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TablePaginationBar } from "@/components/shared/data-table";
import { TableSearch } from "@/components/shared/table-search";
import { Button } from "@/components/ui/button";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { SectionTitle } from "@/features/dashboard/components/EmptyState";
import {
  cardTitleClass,
  dashboardCardClass,
  dashboardPageShellClass,
} from "@/features/dashboard/data/dashboard-styles";
import { CategoryCard } from "@/features/records/components/CategoryCard";
import { DocActionsMenu } from "@/features/records/components/DocActionsMenu";
import { DocumentsTable } from "@/features/records/components/DocumentsTable";
import {
  DOCUMENTS,
  CATEGORIES,
  DOC_ICON_MAP,
  categoryDocumentCount,
  type CategoryId,
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

const MOBILE_PAGE_SIZES = [10, 15, 25, 50];

function DocumentsHeading({ title }: { title: string }) {
  return (
    <div className="flex min-w-0 shrink-0 flex-col gap-0.5">
      <h2 className={cardTitleClass}>{title}</h2>
      <p className={typo.bodyM}>
        Search, filter, and open your uploaded health documents.
      </p>
    </div>
  );
}

export function RecordsPageContent() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [query, setQuery] = useState("");
  const [mobilePage, setMobilePage] = useState(1);
  const [mobilePageSize, setMobilePageSize] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory =
    CATEGORIES.find((category) => category.id === activeCategory) ??
    CATEGORIES[0]!;

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DOCUMENTS.filter((doc) => {
      if (activeCategory !== "all" && doc.type !== activeCategory) return false;
      if (!q) return true;
      return doc.name.toLowerCase().includes(q);
    });
  }, [activeCategory, query]);

  const mobilePageCount = Math.max(
    1,
    Math.ceil(filteredDocuments.length / mobilePageSize) || 1,
  );
  const safeMobilePage = Math.min(Math.max(1, mobilePage), mobilePageCount);

  useEffect(() => {
    setMobilePage(1);
  }, [activeCategory, query, mobilePageSize]);

  useEffect(() => {
    if (mobilePage !== safeMobilePage) setMobilePage(safeMobilePage);
  }, [mobilePage, safeMobilePage]);

  const pagedMobileDocuments = useMemo(() => {
    const start = (safeMobilePage - 1) * mobilePageSize;
    return filteredDocuments.slice(start, start + mobilePageSize);
  }, [filteredDocuments, mobilePageSize, safeMobilePage]);

  const search = (
    <TableSearch
      value={query}
      onChange={setQuery}
      placeholder="Search files…"
      aria-label="Search documents"
    />
  );

  const heading = <DocumentsHeading title={selectedCategory.label} />;

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
          <div className="grid grid-cols-1 gap-dash-gutter sm:grid-cols-2 xl:grid-cols-5">
            {CATEGORIES.map((cat) => {
              const count = categoryDocumentCount(cat.id);
              return (
                <CategoryCard
                  key={cat.id}
                  label={cat.label}
                  count={`${count} ${count === 1 ? "file" : "files"}`}
                  updated={cat.updated}
                  iconSrc={cat.iconSrc}
                  selected={activeCategory === cat.id}
                  onSelect={() => setActiveCategory(cat.id)}
                />
              );
            })}
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
              {heading}
              {search}
            </div>
          </div>

          <div className="overflow-hidden self-stretch pt-2 pb-2 lg:hidden">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
                <p className="font-sans text-sm font-medium leading-5 text-foreground">
                  No documents found
                </p>
                <p className="font-sans text-sm font-normal leading-5 text-muted-foreground">
                  Try a different search or category.
                </p>
              </div>
            ) : (
              <>
                <ul className="flex flex-col px-5">
                  {pagedMobileDocuments.map((doc) => {
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
                </ul>
                <div className="mt-1 border-t border-border py-3">
                  <TablePaginationBar
                    total={filteredDocuments.length}
                    page={safeMobilePage}
                    pageSize={mobilePageSize}
                    pageSizes={MOBILE_PAGE_SIZES}
                    onPageChange={setMobilePage}
                    onPageSizeChange={(size) => {
                      setMobilePageSize(size);
                      setMobilePage(1);
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="hidden w-full lg:block">
            <DocumentsTable
              data={filteredDocuments}
              leading={heading}
              tools={search}
            />
          </div>
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
