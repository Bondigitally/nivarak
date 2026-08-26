'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneField, isValidPhoneNumber } from '@/features/auth/components/primitives/PhoneField';
import { OtpVerifyStep } from '@/features/auth/components/steps/OtpVerifyStep';

interface PhoneOtpStepProps {
  onSendOtp: (phone: string) => Promise<void>;
  onVerified: (phone: string, otp: string) => Promise<void>;
  submitLabel?: string;
  /** Called when the step moves between phone entry and OTP entry */
  onPhaseChange?: (phase: 'phone' | 'otp', phone: string) => void;
  /** Restore OTP UI after a parent flow remount */
  initialPhone?: string;
  initialOtpSent?: boolean;
  length?: number;
}

export function PhoneOtpStep({
  onSendOtp,
  onVerified,
  submitLabel = 'Continue',
  onPhaseChange,
  initialPhone,
  initialOtpSent = false,
  length = 6,
}: PhoneOtpStepProps) {
  const [phone, setPhone] = useState(initialPhone || '+91');
  const [otpSent, setOtpSent] = useState(initialOtpSent);
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
      await onSendOtp(phone);
      setOtpSent(true);
      onPhaseChange?.('otp', phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(otp: string) {
    await onVerified(phone, otp);
  }

  function handleChangePhone() {
    setOtpSent(false);
    setError(null);
    onPhaseChange?.('phone', phone);
  }

  if (otpSent) {
    return (
      <OtpVerifyStep
        destination={phone}
        submitLabel={submitLabel}
        changeDestinationLabel="Change Phone Number"
        showHeading={false}
        onVerify={handleVerify}
        onResend={() => onSendOtp(phone)}
        onChangeDestination={handleChangePhone}
        length={length}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <PhoneField
        id="phone"
        label="Phone number"
        value={phone}
        onChange={setPhone}
        placeholder="Enter your phone number"
        disabled={loading}
        error={error ?? undefined}
      />

      <Button
        size="cta"
        className="w-full"
        loading={loading}
        onClick={handleSendOtp}
        disabled={!isValidPhoneNumber(phone)}
      >
        Send OTP
      </Button>
    </div>
  );
}
