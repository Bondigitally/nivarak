'use client';

import { useCallback, useEffect, useState } from 'react';

export const OTP_RESEND_SECONDS = 30;

export function formatResendCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function useOtpResendCountdown(durationSeconds = OTP_RESEND_SECONDS) {
  const [remaining, setRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setTimeout(() => {
      setRemaining((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [remaining]);

  const restart = useCallback(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  return {
    remaining,
    canResend: remaining <= 0,
    restart,
  };
}
