'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  PhoneField,
  isValidPhoneNumber,
} from '@/components/auth/primitives/PhoneField';
import { OtpVerifyStep } from '@/components/auth/steps/OtpVerifyStep';
import { ApiError } from '@/lib/api';

// TEMP MOCK — fixed code for /dev/otp. Remove with uiMock when API is wired.
const UI_MOCK_OTP = '123456';

interface PhoneOtpStepProps {
  onVerified: (phone: string, otp: string) => Promise<void>;
  submitLabel?: string;
  /** Called when the step moves between phone entry and OTP entry */
  onPhaseChange?: (phase: 'phone' | 'otp', phone: string) => void;
  /** Restore OTP UI after a parent flow remount */
  initialPhone?: string;
  initialOtpSent?: boolean;
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
  initialPhone,
  initialOtpSent = false,
  uiMock = false,
}: PhoneOtpStepProps) {
  const [phone, setPhone] = useState(
    initialPhone || (uiMock ? '+919876543210' : '+91'),
  );
  const [otpSent, setOtpSent] = useState(uiMock || initialOtpSent);
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
        setOtpSent(true);
        onPhaseChange?.('otp', phone);
        return;
      }

      setOtpSent(true);
      onPhaseChange?.('otp', phone);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(otp: string) {
    if (uiMock && otp !== UI_MOCK_OTP) {
      throw new Error(`Use mock code ${UI_MOCK_OTP}`);
    }

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
        onResend={() => {
          void handleSendOtp();
        }}
        onChangeDestination={handleChangePhone}
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
