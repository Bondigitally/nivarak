'use client';

/**
 * TEMP MOCK PATH — /dev/forgot-otp
 * OTP typing screen (Figma 641:3356) without backend.
 * Delete this file (and /dev/otp) when auth API is wired.
 */

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/layout/AuthLayout';
import { AuthCard } from '@/components/auth/layout/AuthCard';
import { OtpVerifyStep } from '@/components/auth/steps/OtpVerifyStep';

export default function DevForgotOtpPage() {
  const router = useRouter();

  return (
    <AuthLayout>
      <AuthCard flowKey="dev-forgot-otp">
        {/* TEMP MOCK — pure OTP UI, no email field / no API */}
        <OtpVerifyStep
          destination="xxxxletteret@gmail.com"
          changeDestinationLabel="Change Email"
          onVerify={async () => {
            // TEMP MOCK — no-op
          }}
          onResend={() => {
            // TEMP MOCK — no-op
          }}
          onChangeDestination={() => router.push('/forgot-password')}
        />
      </AuthCard>
    </AuthLayout>
  );
}
