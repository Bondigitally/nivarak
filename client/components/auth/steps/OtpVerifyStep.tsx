'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/auth/primitives/OtpInput';
import { authType } from '@/lib/auth/typography';
import { cn } from '@/lib/utils';

interface OtpVerifyStepProps {
  /** Masked destination shown in the subtitle (email or phone) */
  destination: string;
  submitLabel?: string;
  changeDestinationLabel?: string;
  onVerify?: (otp: string) => Promise<void> | void;
  onResend?: () => void;
  onChangeDestination?: () => void;
}

/**
 * OTP typing screen — matches Figma Auth Card (node 641:3356).
 * No phone field / no "Verification code" label / no dev-code banner.
 */
export function OtpVerifyStep({
  destination,
  submitLabel = 'Verify & Continue',
  changeDestinationLabel = 'Change Email',
  onVerify,
  onResend,
  onChangeDestination,
}: OtpVerifyStepProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await onVerify?.(otp);
    } catch {
      setError('Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-2">
        <h1 className={authType.headingXxl}>Enter Verification Code</h1>
        <p className={authType.bodyL}>
          We&apos;ve sent a 6-digit verification code to{' '}
          <span className="text-foreground">{destination}</span>
        </p>
      </div>

      <OtpInput value={otp} onChange={setOtp} disabled={loading} error={error ?? undefined} />

      <Button
        type="button"
        size="cta"
        className="w-full"
        loading={loading}
        onClick={handleVerify}
      >
        {submitLabel}
      </Button>

      <div className="flex w-full flex-col items-center gap-2 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className={authType.bodyM}>Haven&apos;t received the OTP?</span>
          <button
            type="button"
            className={cn(authType.link, 'disabled:opacity-50')}
            disabled={loading}
            onClick={onResend}
          >
            Resend OTP
          </button>
        </div>
        <button
          type="button"
          className={cn(authType.link, 'disabled:opacity-50')}
          disabled={loading}
          onClick={onChangeDestination}
        >
          {changeDestinationLabel}
        </button>
      </div>
    </div>
  );
}
