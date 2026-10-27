"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IaspAssessmentModal } from "@/features/assessments/components/IaspAssessmentModal";
import { IaspResumeConfirmDialog } from "@/features/assessments/components/IaspResumeConfirmDialog";
import {
  INITIAL_IASP_FLOW_STATE,
  clearIaspDraft,
  loadIaspDraft,
  toIaspAnswersPayload,
  type IaspFlowState,
} from "@/features/assessments/data/iasp-assessment-draft";
import {
  bindActiveIaspSession,
  clearStoredIaspSessionId,
  fetchIaspSession,
  getStoredIaspSessionId,
  iaspSessionToFlowState,
  isTerminalIaspSession,
  startIaspSession,
  syncIaspSession,
} from "@/features/assessments/lib/iasp-session-api";

type IaspAssessmentLauncherProps = {
  /** Called when the user closes the assessment modal. */
  onDismiss?: () => void;
};

/** Boots resume-or-start confirm + assessment modal. Does not create a session. */
export function IaspAssessmentLauncher({
  onDismiss,
}: IaspAssessmentLauncherProps) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [startingNew, setStartingNew] = useState(false);
  const [flowState, setFlowState] = useState<IaspFlowState>(
    INITIAL_IASP_FLOW_STATE,
  );
  const [flowKey, setFlowKey] = useState(0);

  const launch = useCallback(() => {
    const storedId = getStoredIaspSessionId();
    if (!storedId) {
      bindActiveIaspSession(null);
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
      return;
    }

    void fetchIaspSession(storedId)
      .then((session) => {
        if (session.status === "in_progress") {
          bindActiveIaspSession(session.sessionId);
          setFlowState(iaspSessionToFlowState(session));
          setConfirmOpen(true);
          setOpen(false);
          return;
        }
        if (session.status === "completed") {
          bindActiveIaspSession(session.sessionId);
          setFlowState(iaspSessionToFlowState(session));
          setConfirmOpen(false);
          setOpen(true);
          return;
        }
        if (isTerminalIaspSession(session.status)) {
          clearStoredIaspSessionId(session.sessionId);
          clearIaspDraft();
          setFlowState(INITIAL_IASP_FLOW_STATE);
          setConfirmOpen(false);
          setOpen(true);
        }
      })
      .catch(() => {
        clearStoredIaspSessionId(storedId);
        clearIaspDraft();
        setFlowState(INITIAL_IASP_FLOW_STATE);
        setConfirmOpen(false);
        setOpen(true);
      })
      .finally(() => {
        setBootstrapped(true);
      });
  }, []);

  useEffect(() => {
    void Promise.resolve().then(launch);
  }, [launch]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) onDismiss?.();
  }

  function handleContinuePrevious() {
    const storedId = getStoredIaspSessionId();
    if (storedId) {
      setConfirmOpen(false);
      setFlowKey((key) => key + 1);
      setOpen(true);
      return;
    }

    setStartingNew(true);
    void startIaspSession()
      .then(() =>
        syncIaspSession({
          aboutYou: flowState.aboutYou,
          answers: toIaspAnswersPayload(flowState.answers),
          redFlags: [...flowState.redFlags],
          flowStep: flowState.step,
          pageIndex: flowState.pageIndex,
        }),
      )
      .then(() => {
        setConfirmOpen(false);
        setFlowKey((key) => key + 1);
        setOpen(true);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Could not resume the assessment";
        toast.error(message);
      })
      .finally(() => setStartingNew(false));
  }

  function handleStartNew() {
    if (startingNew) return;
    const previousId = getStoredIaspSessionId();
    setStartingNew(true);
    void startIaspSession({ supersedeSessionId: previousId })
      .then(() => {
        clearIaspDraft();
        setFlowState(INITIAL_IASP_FLOW_STATE);
        setFlowKey((key) => key + 1);
        setConfirmOpen(false);
        setOpen(true);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Could not start a new assessment";
        toast.error(message);
      })
      .finally(() => setStartingNew(false));
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
