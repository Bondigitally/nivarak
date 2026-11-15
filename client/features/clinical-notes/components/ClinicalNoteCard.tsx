"use client";

import Link from "next/link";
import {
  Calendar03Icon,
  File01Icon,
  Pen01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  memberPortraitCardBodyClass,
  memberPortraitCardClass,
  memberPortraitCardMediaClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import type { DoctorNoteRow } from "@/lib/domain/doctor";
import { BADGE_ICON_SIZE, EMPTY_ICON_SIZE } from "@/lib/icons";
import {
  cardShadowClass,
  cardShadowHoverClass,
} from "@/lib/tokens/elevation";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

function noteTypeClass(type: DoctorNoteRow["type"]) {
  switch (type) {
    case "SOAP":
      return "bg-info-muted text-info";
    case "Progress":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function noteMediaTone(type: DoctorNoteRow["type"]) {
  switch (type) {
    case "SOAP":
      return "bg-info-muted text-info";
    case "Progress":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function NoteMetaRow({
  icon,
  children,
}: {
  icon: typeof UserIcon;
  children: string;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <span
        className="inline-flex size-4 shrink-0 text-muted-foreground"
        aria-hidden
      >
        <AppIcon icon={icon} size={BADGE_ICON_SIZE} />
      </span>
      <span className={cn(typo.bodyS, "truncate text-muted-foreground")}>
        {children}
      </span>
    </div>
  );
}

export function ClinicalNoteCard({
  note,
  showPatient = true,
}: {
  note: DoctorNoteRow;
  /** When false, omit patient identity (e.g. patient chart Notes tab). */
  showPatient?: boolean;
}) {
  const ariaLabel = showPatient
    ? `Open note ${note.title} for ${note.patientName}`
    : `Open note ${note.title}`;

  return (
    <Link
      href={`/patients/${note.patientId}/notes/${note.id}`}
      aria-label={ariaLabel}
      className={cn(
        memberPortraitCardClass,
        cardShadowClass,
        cardShadowHoverClass,
        "transform-gpu transition-[transform,box-shadow] duration-200 ease-out",
        "motion-safe:hover:-translate-y-0.5",
      )}
    >
      <div
        className={cn(
          memberPortraitCardMediaClass,
          "flex items-center justify-center",
          noteMediaTone(note.type),
        )}
      >
        <AppIcon icon={File01Icon} size={EMPTY_ICON_SIZE} />
      </div>

      <div className={memberPortraitCardBodyClass}>
        <div className="flex min-w-0 items-center gap-2">
          <h3
            className={cn(
              typo.headingS,
              "min-w-0 flex-1 truncate text-foreground",
            )}
            title={note.title}
          >
            {note.title}
          </h3>
          <span
            className={cn(
              statusBadgeClass,
              "shrink-0",
              noteTypeClass(note.type),
            )}
          >
            {note.type}
          </span>
        </div>

        {showPatient ? (
          <NoteMetaRow icon={UserIcon}>
            {`${note.patientName} · ${note.patientCode}`}
          </NoteMetaRow>
        ) : null}
        <NoteMetaRow icon={Calendar03Icon}>{note.date}</NoteMetaRow>
        <NoteMetaRow icon={Pen01Icon}>
          {`${note.author} · ${note.status}`}
        </NoteMetaRow>
      </div>
    </Link>
  );
}
