"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { BellRingIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  dialogBodyShellClass,
  dialogCloseButtonClass,
  dialogFooterShellClass,
  dialogHeaderShellClass,
  dialogPrimitiveContentClass,
} from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import type { CareTask } from "../data/tasks-data";
import { TaskCheckbox } from "./TaskCheckbox";

const GOOGLE_CALENDAR_REMINDER_OPTIONS = [
  { id: "at-time", label: "At time of task" },
  { id: "5m", label: "5 minutes before" },
  { id: "10m", label: "10 minutes before" },
  { id: "30m", label: "30 minutes before" },
  { id: "1h", label: "1 hour before" },
  { id: "1d", label: "1 day before" },
] as const;

type ReminderTimingId = (typeof GOOGLE_CALENDAR_REMINDER_OPTIONS)[number]["id"];
type ReminderScope = "all" | "choose";

function GentleReminderForm({
  tasks,
  onOpenChange,
}: {
  tasks: CareTask[];
  onOpenChange: (open: boolean) => void;
}) {
  const [scope, setScope] = useState<ReminderScope>("all");
  const [timing, setTiming] = useState<ReminderTimingId>("10m");
  const [chosenIds, setChosenIds] = useState<string[]>(() =>
    tasks.map((task) => task.id),
  );

  const taskIds = new Set(tasks.map((task) => task.id));
  const selectedIds = chosenIds.filter((id) => taskIds.has(id));
  const selectedCount = scope === "all" ? tasks.length : selectedIds.length;

  function handleScopeChange(next: ReminderScope) {
    setScope(next);
    if (next === "choose") {
      setChosenIds((current) => current.filter((id) => taskIds.has(id)));
    }
  }

  function toggleChosen(id: string) {
    if (!taskIds.has(id)) return;
    setChosenIds((current) =>
      current.includes(id)
        ? current.filter((taskId) => taskId !== id)
        : [...current, id],
    );
  }

  return (
    <>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={dialogPrimitiveContentClass("max-w-160 sm:max-w-160")}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
      >
        <DialogHeader className={dialogHeaderShellClass}>
          <div className="flex min-w-0 items-center gap-3 pr-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-info-muted text-info">
              <AppIcon icon={BellRingIcon} />
            </span>
            <div className="min-w-0">
              <DialogTitle className={cn(typo.headingXl, "text-foreground")}>
                Add gentle reminder
              </DialogTitle>
              <DialogDescription className={cn(typo.bodyM, "mt-1")}>
                {scope === "choose" && selectedIds.length > 0
                  ? "Set a Google Calendar reminder for your selected tasks."
                  : "Google Calendar reminder options for your incomplete care tasks."}
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              className={dialogCloseButtonClass}
            >
              <AppIcon icon={Cancel01Icon} />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className={cn(dialogBodyShellClass, "gap-5")}>
          <div className="flex flex-col gap-2">
            <p className={cn(typo.label, "text-foreground")}>Tasks</p>
            <SegmentedControl
              ariaLabel="Reminder task scope"
              layoutId="gentleReminderScope"
              value={scope}
              onChange={handleScopeChange}
              surface="card"
              options={[
                { id: "all", label: "All tasks" },
                { id: "choose", label: "Choose tasks" },
              ]}
            />
          </div>

          {scope === "choose" ? (
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border border-border bg-card p-2">
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const checked = selectedIds.includes(task.id);
                  return (
                    <label
                      key={task.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition-colors",
                        checked ? "bg-background" : "hover:bg-background/80",
                      )}
                    >
                      <span className="mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChosen(task.id)}
                          className="sr-only"
                        />
                        <TaskCheckbox completed={checked} hoverPreview={false} />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cn(
                            typo.bodyM,
                            "block font-medium text-foreground",
                          )}
                        >
                          {task.label}
                        </span>
                        <span className={cn(typo.caption, "block")}>
                          {task.time}
                        </span>
                      </span>
                    </label>
                  );
                })
              ) : (
                <p className={cn(typo.bodyM, "px-2 py-3 text-center")}>
                  No incomplete tasks available.
                </p>
              )}
            </div>
          ) : (
            <p className={cn(typo.bodyM, "rounded-md bg-background px-3 py-2.5")}>
              Reminder will be set for all {tasks.length} incomplete
              task{tasks.length === 1 ? "" : "s"}.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <p className={cn(typo.label, "text-foreground")}>
              Google Calendar reminder
            </p>
            <div className="flex flex-col gap-1">
              {GOOGLE_CALENDAR_REMINDER_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition-colors",
                    timing === option.id
                      ? "border-info/50 bg-info-muted"
                      : "border-border bg-card hover:bg-background",
                  )}
                >
                  <input
                    type="radio"
                    name="reminder-timing"
                    checked={timing === option.id}
                    onChange={() => setTiming(option.id)}
                    className="size-4 shrink-0 accent-info"
                  />
                  <span className={cn(typo.bodyM, "text-foreground")}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter
          className={cn(
            dialogFooterShellClass,
            "flex-row items-center justify-between gap-2 py-4",
          )}
        >
          <p className={cn(typo.caption, "self-center")}>
            {selectedCount} task{selectedCount === 1 ? "" : "s"} selected
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="info-outline"
              disabled={scope === "choose" && selectedIds.length === 0}
              onClick={() => onOpenChange(false)}
            >
              Add reminder
            </Button>
          </div>
        </DialogFooter>
      </DialogPrimitive.Content>
    </>
  );
}

export function GentleReminderModal({
  open,
  onOpenChange,
  tasks,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: CareTask[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {open ? (
          <GentleReminderForm tasks={tasks} onOpenChange={onOpenChange} />
        ) : null}
      </DialogPortal>
    </Dialog>
  );
}
