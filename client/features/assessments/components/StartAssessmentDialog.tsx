"use client";

import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppIcon } from "@/components/shared/AppIcon";
import { BADGE_ICON_SIZE } from "@/lib/icons";
import { PatientAvatar } from "@/components/shared/PatientAvatar";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogBodyShellClass,
  dialogCloseButtonClass,
  dialogContentMotionClass,
  dialogContentPositionClass,
  dialogHeaderShellClass,
  dialogShellClass,
} from "@/components/ui/dialog";
import { fieldInputClassName } from "@/components/ui/input";
import { getDoctorPatients } from "@/features/patients/data/doctor-patients-data";
import type { DoctorPatientRow } from "@/lib/domain/doctor";
import { ICON_SIZE, ICON_STROKE } from "@/lib/icons";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const RESULTS_EASE = [0.22, 1, 0.36, 1] as const;

function matchesPatient(patient: DoctorPatientRow, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return false;
  return [patient.name, patient.code].some((value) =>
    value.toLowerCase().includes(needle),
  );
}

function openCga(patientId: string) {
  window.location.assign(`/patients/${patientId}/assessments/cga-new`);
}

export function StartAssessmentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPatientId?: string;
}) {
  const reducedMotion = useReducedMotion();
  const patients = useMemo(() => getDoctorPatients(), []);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  const results = useMemo(() => {
    return patients.filter((p) => matchesPatient(p, query)).slice(0, 8);
  }, [patients, query]);

  const showEmpty = Boolean(query.trim()) && results.length === 0;
  const showResults = Boolean(query.trim()) && (results.length > 0 || showEmpty);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        {/*
          Transparent outer shell (no clip) so the results can float below the
          search field without expanding the card or showing a square edge
          behind the rounded card.
        */}
        <DialogPrimitive.Content
          className={cn(
            dialogContentPositionClass,
            dialogContentMotionClass,
            "z-100 w-[calc(100%-2rem)] max-w-md border-0 bg-transparent p-0 shadow-none outline-none",
          )}
        >
          <div className={cn(dialogShellClass, "w-full")}>
            <div className={cn(dialogHeaderShellClass, "border-b-0")}>
              <div className="min-w-0">
                <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                  Start CGA
                </DialogTitle>
                <DialogDescription
                  className={cn(typo.bodyM, "mt-1 text-muted-foreground")}
                >
                  Search for a patient to begin a Comprehensive Geriatric
                  Assessment.
                </DialogDescription>
              </div>
              <DialogPrimitive.Close
                className={cn(
                  "inline-flex items-center justify-center",
                  dialogCloseButtonClass,
                )}
                aria-label="Close"
              >
                <AppIcon icon={Cancel01Icon} size={BADGE_ICON_SIZE} />
              </DialogPrimitive.Close>
            </div>

            <div className={cn(dialogBodyShellClass, "gap-0")}>
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={ICON_SIZE}
                  strokeWidth={ICON_STROKE}
                  color="currentColor"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
                  absoluteStrokeWidth
                />
                <input
                  id="cga-patient-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by patient name or ID"
                  autoComplete="off"
                  autoFocus
                  aria-label="Search by patient name or ID"
                  aria-autocomplete="list"
                  aria-controls="cga-patient-results"
                  aria-expanded={showResults}
                  className={cn(
                    fieldInputClassName,
                    "pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden",
                  )}
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={ICON_SIZE}
                      strokeWidth={ICON_STROKE}
                      color="currentColor"
                      absoluteStrokeWidth
                    />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showResults ? (
              <motion.div
                key="cga-patient-results"
                id="cga-patient-results"
                role="listbox"
                aria-label="Matching patients"
                initial={reducedMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.16,
                  ease: RESULTS_EASE,
                }}
                className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-56 overflow-y-auto overscroll-contain rounded-md border border-border bg-card p-1.5 shadow-[0_12px_24px_-4px_rgba(17,24,39,0.16)]"
              >
                {results.length > 0 ? (
                  <ul>
                    {results.map((patient) => (
                      <li
                        key={patient.id}
                        role="option"
                        aria-selected={false}
                      >
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            if (event.button !== 0) return;
                            event.preventDefault();
                            openCga(patient.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter" && event.key !== " ")
                              return;
                            event.preventDefault();
                            openCga(patient.id);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-sm px-2.5 py-2.5 text-left transition-colors",
                            "hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                          )}
                        >
                          <PatientAvatar
                            initials={patient.initials}
                            riskLevel={patient.riskLevel}
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                typo.bodyM,
                                "block truncate font-medium text-foreground",
                              )}
                            >
                              {patient.name}
                            </span>
                            <span
                              className={cn(
                                typo.caption,
                                "block truncate text-muted-foreground",
                              )}
                            >
                              {patient.code} · {patient.age}y · {patient.gender}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p
                    className={cn(
                      typo.bodyS,
                      "px-2.5 py-2.5 text-muted-foreground",
                    )}
                  >
                    No patients match “{query.trim()}”.
                  </p>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
