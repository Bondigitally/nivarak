"use client";

import { useRef, useState } from "react";
import {
  INITIAL_IASP_FLOW_STATE,
  clearIaspDraft,
  hasIaspProgress,
  saveIaspDraft,
  toIaspAnswersPayload,
  type IaspFlowState,
} from "../data/iasp-assessment-draft";
import { clearStoredIaspSessionId, syncIaspSession } from "../lib/iasp-session-api";
import { IaspAssessmentFlow } from "./IaspAssessmentFlow";
import { IaspAssessmentRoot } from "./IaspAssessmentModalShell";
import { IaspExitConfirmDialog } from "./IaspExitConfirmDialog";

export function IaspAssessmentModal({
  open,
  onOpenChange,
  initialState = INITIAL_IASP_FLOW_STATE,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialState?: IaspFlowState;
}) {
  const [flowState, setFlowState] = useState<IaspFlowState>(initialState);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  // Prevents the Radix close cascade from immediately re-opening the exit
  // confirm dialog after the user dismisses it (~400 ms suppression window).
  const suppressExitConfirmUntilRef = useRef(0);

  function resetFlow() {
    clearIaspDraft();
    clearStoredIaspSessionId();
    setFlowState(INITIAL_IASP_FLOW_STATE);
  }

  function closeAssessment() {
    if (flowState.step === "results") {
      clearIaspDraft();
      // Keep session id so a later visit can still see unlock status after pay.
      setFlowState(INITIAL_IASP_FLOW_STATE);
      onOpenChange(false);
      return;
    }

    if (hasIaspProgress(flowState)) {
      saveIaspDraft(flowState);
      void syncIaspSession({
        aboutYou: flowState.aboutYou,
        answers: toIaspAnswersPayload(flowState.answers),
        redFlags: [...flowState.redFlags],
        flowStep: flowState.step,
        pageIndex: flowState.pageIndex,
      }).catch(() => {});
    } else {
      clearIaspDraft();
      setFlowState(INITIAL_IASP_FLOW_STATE);
    }

    onOpenChange(false);
  }

  function dismissExitConfirm() {
    suppressExitConfirmUntilRef.current = Date.now() + 400;
    setExitConfirmOpen(false);
  }

  /**
   * Close-request decision tree:
   *  - Open request → clear any stale exit confirm and let through.
   *  - Within suppress window → ignore (Radix cascade after dismiss).
   *  - Already showing exit confirm → ignore duplicate close.
   *  - On the results step → close immediately (no unsaved progress to warn about).
   *  - Has progress → show exit confirm dialog.
   *  - No progress → close immediately (nothing to lose).
   */
  function handleOpenChange(next: boolean) {
    if (next) {
      setExitConfirmOpen(false);
      onOpenChange(true);
      return;
    }

    if (Date.now() < suppressExitConfirmUntilRef.current) {
      return;
    }

    if (exitConfirmOpen) {
      return;
    }

    if (flowState.step === "results") {
      closeAssessment();
      return;
    }

    if (hasIaspProgress(flowState)) {
      setExitConfirmOpen(true);
      return;
    }

    closeAssessment();
  }

  const flow = open ? (
    <IaspAssessmentFlow
      state={flowState}
      setState={setFlowState}
      onReset={resetFlow}
    />
  ) : null;

  return (
    <>
      <IaspExitConfirmDialog
        open={exitConfirmOpen}
        onContinue={dismissExitConfirm}
        onCloseAssessment={() => {
          suppressExitConfirmUntilRef.current = Date.now() + 400;
          setExitConfirmOpen(false);
          closeAssessment();
        }}
      />
      <IaspAssessmentRoot open={open} onOpenChange={handleOpenChange}>
        {flow}
      </IaspAssessmentRoot>
    </>
  );
}
