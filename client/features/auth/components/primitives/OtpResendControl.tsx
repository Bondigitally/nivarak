'use client';

import { useState } from 'react';
import { typo } from '@/lib/tokens/typography';
import { cn } from '@/lib/utils';
import {
  formatResendCountdown,
  useOtpResendCountdown,
} from '@/features/auth/lib/otp-resend';

interface OtpResendControlProps {
  onResend: () => Promise<void> | void;
  disabled?: boolean;
  prompt?: string;
  actionLabel?: string;
}

export function OtpResendControl({
  onResend,
  disabled = false,
  prompt = "Haven't received the OTP?",
  actionLabel = 'Resend OTP',
}: OtpResendControlProps) {
  const { remaining, canResend, restart } = useOtpResendCountdown();
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!canResend || loading || disabled) return;
    setLoading(true);
    try {
      await onResend();
      restart();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-center">
      <span className={typo.bodyM}>{prompt}</span>
      {canResend ? (
        <button
          type="button"
          className={cn(typo.link, 'disabled:opacity-50')}
          disabled={loading || disabled}
          onClick={() => void handleResend()}
        >
          {actionLabel}
        </button>
      ) : (
        <span className={cn(typo.bodyM, 'tabular-nums text-foreground')}>
          Resend in {formatResendCountdown(remaining)}
        </span>
      )}
    </div>
  );
}
