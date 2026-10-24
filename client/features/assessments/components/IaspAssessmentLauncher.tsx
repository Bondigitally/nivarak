"use client";

import { useCallback, useEffect, useState } from "react";
import { IaspAssessmentModal } from "@/features/assessments/components/IaspAssessmentModal";
import { IaspResumeConfirmDialog } from "@/features/assessments/components/IaspResumeConfirmDialog";
import {
  INITIAL_IASP_FLOW_STATE,
  clearIaspDraft,
  loadIaspDraft,
  type IaspFlowState,
} from "@/features/assessments/data/iasp-assessment-draft";
import { clearStoredIaspSessionId } from "@/features/assessments/lib/iasp-session-api";

type IaspAssessmentLauncherProps = {
  /** Called when the user closes the assessment modal. */
  onDismiss?: () => void;
};

/** Boots resume-draft confirm + assessment modal (used by marketing host). */
export function IaspAssessmentLauncher({
  onDismiss,
}: IaspAssessmentLauncherProps) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [flowState, setFlowState] = useState<IaspFlowState>(
    INITIAL_IASP_FLOW_STATE,
  );
  const [flowKey, setFlowKey] = useState(0);

  const launch = useCallback(() => {
    const draft = loadIaspDraft();
    if (draft) {
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

  useEffect(() => {
    void Promise.resolve().then(launch);
  }, [launch]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) onDismiss?.();
  }

  function handleContinuePrevious() {
    setConfirmOpen(false);
    setFlowKey((key) => key + 1);
    setOpen(true);
  }

  function handleStartNew() {
    clearIaspDraft();
    clearStoredIaspSessionId();
    setFlowState(INITIAL_IASP_FLOW_STATE);
    setFlowKey((key) => key + 1);
    setConfirmOpen(false);
    setOpen(true);
  }

  if (!bootstrapped) {
    return null;
  }

  return (
    <>
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
    </>
  );
}
