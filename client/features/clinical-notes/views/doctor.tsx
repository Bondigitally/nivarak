"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Add01Icon, NoteIcon } from "@hugeicons/core-free-icons";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSearch } from "@/components/shared/table-search";
import { AppIcon } from "@/components/shared/AppIcon";
import { Button } from "@/components/ui/button";
import { ClinicalNoteCard } from "@/features/clinical-notes/components/ClinicalNoteCard";
import { getClinicalNotes } from "@/features/clinical-notes/data/clinical-notes-data";
import { AppPageFrame } from "@/features/dashboard/components/AppPageFrame";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import { EmptyState } from "@/features/dashboard/components/EmptyState";
import {
  dashboardPageShellClass,
  memberPortraitCardGridClass,
} from "@/features/dashboard/data/dashboard-styles";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

export function DoctorClinicalNotesView() {
  const notes = getClinicalNotes();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((row) =>
      [row.patientName, row.patientCode, row.title, row.type, row.author].some(
        (value) => value.toLowerCase().includes(needle),
      ),
    );
  }, [notes, query]);

  return (
    <AppPageFrame>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex min-w-0 items-start justify-between gap-4">
          <PageHeader
            title="Clinical Notes"
            subtitle="SOAP, progress, and consult notes across your panel."
          />
          <Button type="button" variant="primary-outline" className="shrink-0" asChild>
            <Link href="/clinical/notes/new">
              <AppIcon icon={Add01Icon} size={16} />
              Write Note
            </Link>
          </Button>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className={cn(typo.headingL)}>Recent notes</h2>
              <p className={typo.bodyM}>
                Open a note to review or continue drafting documentation.
              </p>
            </div>
            <TableSearch
              value={query}
              onChange={setQuery}
              placeholder="Search notes…"
              aria-label="Search clinical notes"
              className="w-full sm:max-w-72"
            />
          </div>

          {filtered.length > 0 ? (
            <div className={memberPortraitCardGridClass}>
              {filtered.map((note) => (
                <ClinicalNoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={NoteIcon}
              title="No notes found"
              body="Try adjusting your search to find clinical notes."
            />
          )}
        </div>
      </DashboardReveal>
    </AppPageFrame>
  );
}
