'use client';

/**
 * TEMP MOCK PATH — /dev/otp
 * OTP typing screen (Figma 641:3356) without backend.
 * Delete this file (and /dev/forgot-otp) when auth API is wired.
 */

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/layout/AuthLayout';
import { AuthCard } from '@/components/auth/layout/AuthCard';
import { OtpVerifyStep } from '@/components/auth/steps/OtpVerifyStep';

export default function DevPhoneOtpPage() {
  const router = useRouter();

  return (
    <AuthLayout variant="split">
      <AuthCard flowKey="dev-otp">
        {/* TEMP MOCK — pure OTP UI, no phone field / no API */}
        <OtpVerifyStep
          destination="+91••••••3210"
          changeDestinationLabel="Change Phone"
          onVerify={async () => {
            // TEMP MOCK — no-op
          }}
          onResend={() => {
            // TEMP MOCK — no-op
          }}
          onChangeDestination={() => router.push('/login')}
        />
      </AuthCard>
    </AuthLayout>
  );
}
