"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { typo } from "@/lib/tokens/typography";
import { cn } from "@/lib/utils";
import { iaspReportDisplayHeadingClass } from "../data/iasp-assessment-styles";
import {
  loadIaspReportPdfObjectUrl,
  triggerIaspReportPdfDownload,
} from "../lib/open-iasp-report-pdf";
import {
  getIaspReportPdfDownloadName,
  IASP_ASSESSMENT_OPEN_HREF,
} from "../lib/iasp-report-url";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

/**
 * Same-tab PDF viewer — opened after unlock/payment so pop-ups are never required.
 * Generates the finalized @react-pdf report from the unlocked session.
 */
export function IaspDetailedReportPage({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setState({ status: "loading" });

    void loadIaspReportPdfObjectUrl(sessionId).then((result) => {
      if (cancelled) {
        if (result.status === "ready") URL.revokeObjectURL(result.url);
        return;
      }
      if (result.status === "ready") {
        objectUrl = result.url;
        setState({ status: "ready", url: result.url });
        triggerIaspReportPdfDownload(result.url, sessionId);
        return;
      }
      if (result.status === "locked") {
        setState({
          status: "error",
          message:
            "This detailed report is still locked. Unlock it from your assessment results after payment.",
        });
        return;
      }
      setState({ status: "error", message: result.message });
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sessionId, reloadKey]);

  if (state.status === "ready") {
    return (
      <main className="flex h-dvh flex-col bg-[#F7F7F8]">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/80 bg-card px-dash-pad-x py-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <BrandLogo size="compact" />
            <p className={cn(typo.bodyS, "truncate text-muted-foreground")}>
              IASP Assessment Report
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild type="button" variant="secondary" size="sm">
              <a
                href={state.url}
                download={getIaspReportPdfDownloadName(sessionId)}
              >
                Download PDF
              </a>
            </Button>
            <Button asChild type="button" variant="secondary" size="sm">
              <Link href="/">Back</Link>
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1 px-0 sm:px-6 sm:py-4">
          <iframe
            title="IASP Assessment Report"
            src={state.url}
            className="h-full min-h-0 min-w-0 w-full border-0 bg-white shadow-none sm:rounded-lg sm:border sm:border-border/60 sm:shadow-sm"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-dash-pad-x py-8 sm:px-8 sm:py-10">
        <BrandLogo size="compact" />

        {state.status === "loading" ? (
          <div className="space-y-2">
            <h1 className={iaspReportDisplayHeadingClass}>
              Opening your PDF report
            </h1>
            <p className={cn(typo.bodyM, "text-muted-foreground")}>
              Preparing the IASP Assessment Report…
            </p>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="space-y-4">
            <h1 className={iaspReportDisplayHeadingClass}>
              Report unavailable
            </h1>
            <p className={cn(typo.bodyM, "text-muted-foreground")}>
              {state.message}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
              >
                Retry Generating Report
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href={IASP_ASSESSMENT_OPEN_HREF}>Back to assessment</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
