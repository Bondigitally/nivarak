"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { ArrowLeft01Icon, SquareLock02Icon } from "@hugeicons/core-free-icons";
import { AppIcon } from "@/components/shared/AppIcon";
import { ChevronIcon } from "@/components/shared/ChevronIcon";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogFooterShellClass,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldErrorMessage } from "@/components/ui/field-error-message";
import {
  fieldInputClassName,
  fieldSelectTriggerClassName,
} from "@/components/ui/input";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import {
  IASP_LIVING_SITUATION_OPTIONS,
  IASP_LIVING_SITUATION_OTHER,
  IASP_LOCATION_OPTIONS,
  IASP_RELATIONSHIP_OPTIONS,
  IASP_VISIT_FREQUENCY_OPTIONS,
  getIaspAgeError,
  getIaspLivingSituationDisplay,
  isIaspAboutYouComplete,
  isIaspLivingSituationOther,
  sanitizeIaspAgeInput,
  sanitizeIaspLivingSituationOther,
  type IaspAboutYouValues,
} from "../data/iasp-about-you-data";
import {
  iaspDropdownContentClass,
  iaspDropdownItemClass,
  iaspModalScrollBodyClass,
  iaspStepHeaderClass,
} from "../data/iasp-assessment-styles";
import {
  IaspModalCloseButton,
  IaspModalShell,
  IaspProgressBar,
} from "./IaspAssessmentModalShell";

/**
 * Scrolls `element` into view within `container` while preserving padding.
 * Used instead of `scrollIntoView` because the modal body has a fixed header;
 * native `scrollIntoView` would scroll the page, not the modal content area.
 */
function scrollElementIntoContainer(
  container: HTMLElement,
  element: HTMLElement,
  padding = 24,
) {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const bottomOverflow = elementRect.bottom - containerRect.bottom + padding;

  if (bottomOverflow > 0) {
    container.scrollTo({
      top: container.scrollTop + bottomOverflow,
      behavior: "smooth",
    });
    return;
  }

  const topOverflow = containerRect.top - elementRect.top + padding;
  if (topOverflow > 0) {
    container.scrollTo({
      top: container.scrollTop - topOverflow,
      behavior: "smooth",
    });
  }
}

function SelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className={cn(typo.label, "text-foreground")}>
        {label}
      </label>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            id={id}
            type="button"
            className={fieldSelectTriggerClassName}
          >
            <span
              className={cn(
                typo.input,
                "min-w-0 flex-1 truncate",
                !value && "text-placeholder",
              )}
            >
              {value ?? placeholder}
            </span>
            <ChevronIcon
              direction="down"
              className="text-muted-foreground"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className={iaspDropdownContentClass}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={() => onChange(option)}
              className={cn(
                iaspDropdownItemClass,
                value === option && "bg-background",
              )}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LivingSituationField({
  values,
  onChange,
  scrollContainerRef,
}: {
  values: IaspAboutYouValues;
  onChange: (next: IaspAboutYouValues) => void;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const id = useId();
  const otherInputId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);
  const display = getIaspLivingSituationDisplay(values);
  const isOther = isIaspLivingSituationOther(values.livingSituation);

  useEffect(() => {
    if (!isOther) return;

    let frame2 = 0;
    // Double rAF: wait for the conditional "Other" input to fully mount and
    // lay out before scrolling it into view and focusing it.
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        const field = fieldRef.current;
        const input = otherInputRef.current;
        if (!field || !input) return;

        if (container) {
          scrollElementIntoContainer(container, field);
        } else {
          field.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        input.focus({ preventScroll: true });
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      if (frame2) cancelAnimationFrame(frame2);
    };
  }, [isOther, scrollContainerRef]);

  return (
    <div ref={fieldRef} className="flex w-full flex-col gap-2">
      <label htmlFor={id} className={cn(typo.label, "text-foreground")}>
        Living situation
      </label>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            id={id}
            type="button"
            className={fieldSelectTriggerClassName}
          >
            <span
              className={cn(
                typo.input,
                "min-w-0 flex-1 truncate",
                !display && "text-placeholder",
              )}
            >
              {display ?? "Select situation"}
            </span>
            <ChevronIcon
              direction="down"
              className="text-muted-foreground"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className={iaspDropdownContentClass}
        >
          {IASP_LIVING_SITUATION_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={() => {
                if (option === IASP_LIVING_SITUATION_OTHER) {
                  onChange({
                    ...values,
                    livingSituation: IASP_LIVING_SITUATION_OTHER,
                  });
                  return;
                }
                onChange({
                  ...values,
                  livingSituation: option,
                  livingSituationOther: "",
                });
              }}
              className={cn(
                iaspDropdownItemClass,
                values.livingSituation === option && "bg-background",
              )}
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {isOther ? (
        <input
          ref={otherInputRef}
          id={otherInputId}
          type="text"
          autoComplete="off"
          placeholder="Please specify"
          value={values.livingSituationOther}
          onChange={(event) =>
            onChange({
              ...values,
              livingSituation: IASP_LIVING_SITUATION_OTHER,
              livingSituationOther: sanitizeIaspLivingSituationOther(
                event.target.value,
              ),
            })
          }
          className={cn(
            fieldInputClassName,
          )}
        />
      ) : null}
    </div>
  );
}

export function AboutYouStep({
  values,
  onChange,
  onBack,
  onContinue,
}: {
  values: IaspAboutYouValues;
  onChange: (next: IaspAboutYouValues) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [ageBlurred, setAgeBlurred] = useState(false);
  const complete = isIaspAboutYouComplete(values);
  const ageError = getIaspAgeError(values.age);
  const showAgeError =
    Boolean(ageError) && (ageBlurred || values.age.length >= 3);

  return (
    <IaspModalShell>
      <DialogHeader className={iaspStepHeaderClass}>
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className={cn(typo.headingXxl, "text-foreground")}>
            IAS Assessment
          </DialogTitle>
          <IaspModalCloseButton />
        </div>
        <DialogDescription className="sr-only">
          Tell us about your relationship with the person being assessed.
        </DialogDescription>
        <IaspProgressBar value={8} label="Assessment progress" />
      </DialogHeader>

      <div
        ref={bodyRef}
        className={cn(iaspModalScrollBodyClass, "gap-5 py-6 sm:gap-6 sm:py-7")}
      >
        <div className="flex flex-col gap-1">
          <h3 className={cn(typo.headingL, "text-foreground")}>About You</h3>
          <p className={cn(typo.bodyS, "text-muted-foreground")}>
            Tell us about your relationship with the person being assessed.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <SelectField
            label="Your relationship"
            placeholder="Select relationship"
            value={values.relationship}
            options={IASP_RELATIONSHIP_OPTIONS}
            onChange={(relationship) => onChange({ ...values, relationship })}
          />

          <div className="flex w-full flex-col gap-2">
            <label htmlFor="iasp-age" className={cn(typo.label, "text-foreground")}>
              Age
            </label>
            <input
              id="iasp-age"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder="e.g. 65"
              value={values.age}
              aria-invalid={showAgeError}
              onBlur={() => setAgeBlurred(true)}
              onChange={(event) =>
                onChange({
                  ...values,
                  age: sanitizeIaspAgeInput(event.target.value),
                })
              }
              className={cn(
                fieldInputClassName,
                showAgeError &&
                  "border-destructive focus-visible:ring-destructive/30",
              )}
            />
            <FieldErrorMessage error={showAgeError ? ageError : null} />
          </div>

          <SelectField
            label="Location"
            placeholder="Select location"
            value={values.location}
            options={IASP_LOCATION_OPTIONS}
            onChange={(location) => onChange({ ...values, location })}
          />
          <SelectField
            label="Visit frequency"
            placeholder="Select frequency"
            value={values.visitFrequency}
            options={IASP_VISIT_FREQUENCY_OPTIONS}
            onChange={(visitFrequency) =>
              onChange({ ...values, visitFrequency })
            }
          />
          <LivingSituationField
            values={values}
            onChange={onChange}
            scrollContainerRef={bodyRef}
          />
        </div>
      </div>

      <DialogFooter
        className={cn(
          dialogFooterShellClass,
          "flex-col sm:flex-col gap-4 bg-background",
        )}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={onBack}>
            <AppIcon icon={ArrowLeft01Icon} />
            Back
          </Button>
          <Button
            type="button"
            size="cta"
            disabled={!complete}
            onClick={onContinue}
            className="min-w-35"
          >
            Continue
          </Button>
        </div>
        <p
          className={cn(
            typo.caption,
            "flex w-full items-start justify-center gap-2 text-center text-muted-foreground",
          )}
        >
          <AppIcon
            icon={SquareLock02Icon}
            size={14}
            className="mt-0.5 shrink-0"
          />
          <span>
            This information helps contextualise the assessment and is not shared
            publicly.
          </span>
        </p>
      </DialogFooter>
    </IaspModalShell>
  );
}
