'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/features/auth/components/primitives/OtpInput';
import { OtpResendControl } from '@/features/auth/components/primitives/OtpResendControl';
import { typo } from '@/lib/tokens/typography';
import { cn } from '@/lib/utils';

interface OtpVerifyStepProps {
  /** Masked destination shown in the subtitle (email or phone) */
  destination: string;
  submitLabel?: string;
  changeDestinationLabel?: string;
  /** When false, parent already rendered the title (e.g. AuthHeader) */
  showHeading?: boolean;
  onVerify?: (otp: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  onChangeDestination?: () => void;
  length?: number;
}

/**
 * OTP typing screen — matches Figma Auth Card (node 641:3356).
 * No phone field / no "Verification code" label / no dev-code banner.
 */
export function OtpVerifyStep({
  destination,
  submitLabel = 'Verify & Continue',
  changeDestinationLabel = 'Change Email',
  showHeading = true,
  onVerify,
  onResend,
  onChangeDestination,
  length = 6,
}: OtpVerifyStepProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setError(null);
    if (otp.length !== length) {
      setError(`Enter the ${length}-digit code.`);
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
    <div className="flex w-full flex-col gap-6">
      {showHeading && (
        <div className="flex w-full flex-col gap-2">
          <h1 className={typo.headingXxl}>Enter Verification Code</h1>
          <p className={typo.bodyL}>
            We&apos;ve sent a {length}-digit OTP on{' '}
            <span className="text-foreground">{destination}</span>
          </p>
        </div>
      )}

      <div className="flex w-full flex-col gap-1">
        <OtpInput
          value={otp}
          onChange={setOtp}
          length={length}
          disabled={loading}
          error={error ?? undefined}
        />
        <Button
          type="button"
          size="cta"
          className="w-full"
          loading={loading}
          onClick={handleVerify}
        >
          {submitLabel}
        </Button>
      </div>

      <div className="flex w-full flex-col items-center gap-2 text-center">
        <OtpResendControl
          disabled={loading}
          onResend={async () => {
            try {
              await onResend?.();
              setOtp('');
              setError(null);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to resend OTP. Try again.');
              throw err;
            }
          }}
        />
        <button
          type="button"
          className={cn(typo.link, 'disabled:opacity-50')}
          disabled={loading}
          onClick={onChangeDestination}
        >
          {changeDestinationLabel}
        </button>
      </div>
    </div>
  );
}
