"use client";

import { DashboardPageFrame } from "@/features/dashboard/components/HomeTopBar";
import { DashboardReveal } from "@/features/dashboard/components/DashboardReveal";
import {
  dashboardPageShellClass,
  statusBadgeClass,
} from "@/features/dashboard/data/dashboard-styles";
import { getHomeDashboardData } from "@/features/dashboard/data/home-data";
import { IasScoreCard } from "@/features/dashboard/components/IasScoreCard";
import { SectionInfoButton } from "@/features/dashboard/components/EmptyState";
import { AssessmentActionsMenu } from "@/features/assessments/components/AssessmentActionsMenu";
import { ASSESSMENT_ROWS } from "@/features/assessments/data/assessments-data";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AssignmentsIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/tokens/typography";

export default function AssessmentsPage() {
  const data = getHomeDashboardData();
  const hasAssessment = data?.assessment !== null;
  const assessment = data?.assessment;
  const notificationCount = data?.notificationCount ?? 3;

  return (
    <DashboardPageFrame notificationCount={notificationCount}>
      <DashboardReveal className={cn(dashboardPageShellClass)}>
        <div className="flex flex-col gap-1">
          <h1 className={typo.headingXxl}>Assessments</h1>
          <p className={typo.bodyL}>
            Review your completed health assessments and monitor your progress over time.
          </p>
        </div>

        {hasAssessment && assessment ? (
          <div className="flex flex-col gap-3">
            <IasScoreCard assessment={assessment} variant="plain" />

            <div
              className="flex flex-col items-stretch justify-start self-stretch rounded-[12px] bg-white"
              style={{
                outline: "1px #E5E2E1 solid",
                outlineOffset: "-1px",
                boxShadow: "0px 2px 8px rgba(17, 24, 39, 0.05)",
              }}
            >
              <div className="flex items-center gap-2 self-stretch px-5 pt-5 pb-3">
                <h2 className="font-sans text-[22px] font-semibold leading-7 text-[#1A1A1A]">
                  Recent Assessments
                </h2>
                <span className={cn(statusBadgeClass, "bg-[#F2EBF6] text-[#6C318E]")}>
                  {ASSESSMENT_ROWS.length}
                </span>
                <SectionInfoButton info="Completed health assessments and their results over time. Open a row to view or download the report." />
              </div>

              <div className="overflow-hidden self-stretch rounded-b-[12px] px-5 pt-2 pb-2">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-0">
                    <colgroup>
                      <col />
                      <col className="w-[11rem]" />
                      <col className="w-[9rem]" />
                      <col className="w-14" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#F3F0F6]">
                        <th scope="col" className="h-11 rounded-l-xl px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-[#615A66] whitespace-nowrap">
                          Assessment Name
                        </th>
                        <th scope="col" className="h-11 px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-[#615A66] whitespace-nowrap">
                          Date Completed
                        </th>
                        <th scope="col" className="h-11 px-4 text-left font-sans text-xs font-semibold tracking-[0.3px] text-[#615A66] whitespace-nowrap">
                          Result
                        </th>
                        <th scope="col" className="h-11 w-14 rounded-r-xl px-2">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASSESSMENT_ROWS.map((row, index) => (
                        <tr key={index} className="transition-colors duration-100 hover:bg-[#FAFAFA]">
                          <td className="truncate border-b border-[#F0EDF3] px-4 py-3 font-sans text-sm font-medium leading-5 text-[#201A25]">
                            {row.name}
                          </td>
                          <td className="border-b border-[#F0EDF3] px-4 py-3 font-sans text-sm font-normal leading-5 text-[#5F6368] whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="border-b border-[#F0EDF3] px-4 py-3">
                            <span
                              className={cn(
                                statusBadgeClass,
                                row.statusType === "normal" && "bg-[#ECFDF5] text-[#10B981]",
                                row.statusType === "mid" && "bg-[#FFFBEB] text-[#D97706]",
                                row.statusType === "high" && "bg-[#FFF0F0] text-[#EF4444]"
                              )}
                            >
                              {row.result}
                            </span>
                          </td>
                          <td className="w-14 border-b border-[#F0EDF3] px-2 py-3 text-right">
                            <AssessmentActionsMenu />
                          </td>
                        </tr>
                      ))}
                      <tr className="transition-colors duration-100 hover:bg-[#FAFAFA]">
                        <td colSpan={4} className="px-4 py-3 text-center">
                          <button
                            type="button"
                            className="font-sans text-sm font-medium leading-5 text-[#5F6368] outline-none transition-colors hover:text-[#6C318E]"
                          >
                            Load More
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-[#E9E4ED] bg-white p-6">
            <div className="flex max-w-[480px] flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F2EBF6] text-[#6C318E]">
                <HugeiconsIcon icon={AssignmentsIcon} size={32} strokeWidth={1.75} color="currentColor" />
              </div>
              <h2 className="font-sans text-xl font-semibold leading-7 text-[#1A1A1A]">No assessments yet</h2>
              <p className="mt-2 text-sm font-normal leading-5 text-[#5F6368]">
                Take the Independent Ageing Score (IAS-P) to establish your baseline and unlock personalized care insights.
              </p>
              <Button type="button" variant="default" size="cta" className="mt-6 px-6 text-sm font-medium">
                Take Assessment
              </Button>
            </div>
          </div>
        )}
      </DashboardReveal>
    </DashboardPageFrame>
  );
}
