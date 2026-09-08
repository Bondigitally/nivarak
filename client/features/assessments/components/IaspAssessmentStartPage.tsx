"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IaspAssessmentModal } from "@/features/assessments/components/IaspAssessmentModal";
import { IaspResumeConfirmDialog } from "@/features/assessments/components/IaspResumeConfirmDialog";
import {
  INITIAL_IASP_FLOW_STATE,
  clearIaspDraft,
  createIaspResultsPreviewState,
  isIaspResultsPreviewEnabled,
  loadIaspDraft,
  type IaspFlowState,
} from "@/features/assessments/data/iasp-assessment-draft";

/** Assessment entry — surface page with intro modal on load. */
export function IaspAssessmentStartPage() {
  const router = useRouter();
  const allowExitRef = useRef(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [flowState, setFlowState] = useState<IaspFlowState>(
    INITIAL_IASP_FLOW_STATE,
  );
  const [flowKey, setFlowKey] = useState(0);

  useEffect(() => {
    allowExitRef.current = true;
    const previewResults =
      isIaspResultsPreviewEnabled() &&
      new URLSearchParams(window.location.search).get("preview") === "results";
    const draft = previewResults ? null : loadIaspDraft();

    if (previewResults) {
      setFlowState(createIaspResultsPreviewState());
      setConfirmOpen(false);
      setOpen(true);
    } else if (draft) {
      setFlowState(draft);
      setConfirmOpen(true);
      setOpen(false);
    } else {
      setFlowState(INITIAL_IASP_FLOW_STATE);
      setConfirmOpen(false);
      setOpen(true);
    }
    setBootstrapped(true);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && allowExitRef.current) {
      router.replace("/iasp-assessment");
    }
  }

  function handleContinuePrevious() {
    setConfirmOpen(false);
    setFlowKey((key) => key + 1);
    setOpen(true);
  }

  function handleStartNew() {
    clearIaspDraft();
    setFlowState(INITIAL_IASP_FLOW_STATE);
    setFlowKey((key) => key + 1);
    setConfirmOpen(false);
    setOpen(true);
  }

  if (!bootstrapped) {
    return <main className="relative min-h-screen bg-background" />;
  }

  return (
    <main className="relative min-h-screen bg-background">
      <IaspResumeConfirmDialog
        open={confirmOpen}
        onContinue={handleContinuePrevious}
        onStartNew={handleStartNew}
      />
      <IaspAssessmentModal
        key={flowKey}
        open={open}
        onOpenChange={handleOpenChange}
        initialState={flowState}
      />
    </main>
  );
}
