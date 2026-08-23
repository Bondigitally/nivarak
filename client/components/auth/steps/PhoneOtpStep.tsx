'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  PhoneField,
  isValidPhoneNumber,
} from '@/components/auth/primitives/PhoneField';
import { requestOtp } from '@/lib/api';
import { OtpInput } from '@/components/auth/primitives/OtpInput';
import { ApiError } from '@/lib/api';
import { authType } from '@/lib/auth/typography';
import { cn } from '@/lib/utils';

// TEMP MOCK — fixed code for /dev/otp. Remove with uiMock when API is wired.
const UI_MOCK_OTP = '123456';

interface PhoneOtpStepProps {
  onVerified: (phone: string, otp: string) => Promise<void>;
  submitLabel?: string;
  /** Called when the step moves between phone entry and OTP entry */
  onPhaseChange?: (phase: 'phone' | 'otp', phone: string) => void;
  /**
   * TEMP MOCK — skip API and show OTP typing UI immediately.
   * Remove this prop (and UI_MOCK_OTP) when auth is wired.
   */
  uiMock?: boolean;
}

export function PhoneOtpStep({
  onVerified,
  submitLabel = 'Continue',
  onPhaseChange,
  uiMock = false,
}: PhoneOtpStepProps) {
  const [phone, setPhone] = useState(uiMock ? '+919876543210' : '+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(uiMock);
  const [devCode, setDevCode] = useState<string | null>(uiMock ? UI_MOCK_OTP : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp() {
    setError(null);
    if (!isValidPhoneNumber(phone)) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    try {
      // TEMP MOCK — bypass requestOtp
      if (uiMock) {
        setDevCode(UI_MOCK_OTP);
        setOtpSent(true);
        onPhaseChange?.('otp', phone);
        return;
      }

      const result = await requestOtp(phone);
      setDevCode(result.otp ?? null);
      setOtpSent(true);
      onPhaseChange?.('otp', phone);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      // TEMP MOCK — accept UI_MOCK_OTP only
      if (uiMock) {
        if (otp !== UI_MOCK_OTP) {
          setError(`Use mock code ${UI_MOCK_OTP}`);
          return;
        }
        await onVerified(phone, otp);
        return;
      }

      await onVerified(phone, otp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <PhoneField
        id="phone"
        label="Phone number"
        value={phone}
        onChange={setPhone}
        placeholder="Enter your phone number"
        disabled={otpSent || loading}
        error={!otpSent ? (error ?? undefined) : undefined}
      />

      <AnimatePresence initial={false}>
        {otpSent && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            {devCode && (
              <p
                className={cn(
                  authType.bodyS,
                  'rounded-[14px] border border-border bg-muted px-3 py-2',
                )}
              >
                Dev code: <span className="font-medium text-foreground">{devCode}</span>
              </p>
            )}
            <span className={authType.label}>Verification code</span>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} error={error ?? undefined} />
          </motion.div>
        )}
      </AnimatePresence>

      {!otpSent ? (
        <Button size="cta" className="w-full" loading={loading} onClick={handleSendOtp} disabled={!isValidPhoneNumber(phone)}>
          Send OTP
        </Button>
      ) : (
        <Button size="cta" className="w-full" loading={loading} onClick={handleVerify} disabled={otp.length !== 6}>
          {submitLabel}
        </Button>
      )}
    </div>
  );
}
