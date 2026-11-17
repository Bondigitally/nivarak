"use client";

import {
  fieldInputClassName,
  fieldTextareaClassName,
} from "@/components/ui/input";
import { CgaDatePicker } from "@/features/assessments/components/CgaDatePicker";
import {
  ensureRecentResultRows,
  type CgaLabRow,
} from "@/features/assessments/data/cga-investigations-data";
import { dashboardCardClass } from "@/features/dashboard/data/dashboard-styles";
import { radius } from "@/lib/tokens/radius";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";

const fieldLabelClass = typo.label;
const fieldStackClass = "flex flex-col gap-1.5";
const findingsClass = cn(fieldTextareaClassName, "min-h-[5.5rem]");
const tableCellClass = "min-w-0 px-3 py-2.5 align-top";
const tableHeaderClass = cn(
  fieldLabelClass,
  "min-w-0 truncate px-3 py-3 font-medium whitespace-nowrap text-muted-foreground",
);
const tableRowClass = "border-b border-divider align-top last:border-0";
const tableDateFieldGroupClass = cn(
  radius.md,
  "h-11 w-fit max-w-full flex-nowrap",
  "hover:border-muted-foreground/30 hover:bg-muted/30",
);
const tableDateInputClassName = "text-sm leading-5 tabular-nums";

export function CgaInvestigationsSection({
  labs,
  testsRequestedToday,
  onLabsChange,
  onTestsRequestedTodayChange,
}: {
  labs: CgaLabRow[];
  testsRequestedToday: string;
  onLabsChange: (next: CgaLabRow[]) => void;
  onTestsRequestedTodayChange: (next: string) => void;
}) {
  const recentLabs = ensureRecentResultRows(labs);

  function updateLab(id: string, patch: Partial<CgaLabRow>) {
    onLabsChange(
      recentLabs.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h3 className={typo.headingL}>15.1 Recent results available</h3>
        <div className={cn(dashboardCardClass, "overflow-hidden p-0")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] table-fixed text-left">
              <thead>
                <tr className="border-b border-divider bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className={cn(tableHeaderClass, "w-[28%]")}>Test</th>
                  <th className={cn(tableHeaderClass, "w-[28%]")}>Result</th>
                  <th className={cn(tableHeaderClass, "w-[20%]")}>Date</th>
                  <th className={cn(tableHeaderClass, "w-[24%]")}>
                    Action / flag
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentLabs.map((row) => (
                  <tr key={row.id} className={tableRowClass}>
                    <td className={tableCellClass}>
                      <span className={cn(typo.bodyM, "text-foreground")}>
                        {row.testName}
                      </span>
                    </td>
                    <td className={tableCellClass}>
                      <input
                        id={`cga-lab-result-${row.id}`}
                        type="text"
                        value={row.result}
                        onChange={(e) =>
                          updateLab(row.id, { result: e.target.value })
                        }
                        placeholder="Result"
                        className={fieldInputClassName}
                        aria-label={`${row.testName} result`}
                      />
                    </td>
                    <td className={tableCellClass}>
                      <CgaDatePicker
                        id={`cga-lab-date-${row.id}`}
                        aria-label={`${row.testName} date`}
                        value={row.testDate}
                        onChange={(next) =>
                          updateLab(row.id, { testDate: next })
                        }
                        fieldGroupClassName={tableDateFieldGroupClass}
                        dateInputClassName={tableDateInputClassName}
                      />
                    </td>
                    <td className={tableCellClass}>
                      <input
                        id={`cga-lab-action-${row.id}`}
                        type="text"
                        value={row.action}
                        onChange={(e) =>
                          updateLab(row.id, { action: e.target.value })
                        }
                        placeholder="Action / flag"
                        className={fieldInputClassName}
                        aria-label={`${row.testName} action or flag`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-divider pt-5">
        <h3 className={typo.headingL}>
          15.2 Investigations ordered from this visit
        </h3>
        <div className={fieldStackClass}>
          <label
            className={fieldLabelClass}
            htmlFor="cga-tests-requested-today"
          >
            Tests requested today
          </label>
          <textarea
            id="cga-tests-requested-today"
            value={testsRequestedToday}
            onChange={(e) => onTestsRequestedTodayChange(e.target.value)}
            placeholder="List tests requested from this visit…"
            rows={4}
            className={findingsClass}
          />
        </div>
      </div>
    </div>
  );
}
