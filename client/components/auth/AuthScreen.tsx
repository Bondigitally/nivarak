'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AuthMode } from '@/types/auth';
import { AuthCard } from '@/components/auth/layout/AuthCard';
import { AuthHeader } from '@/components/auth/primitives/AuthHeader';
import { AuthFooter } from '@/components/auth/primitives/AuthFooter';
import { AuthFlowTransition } from '@/components/auth/primitives/AuthFlowTransition';
import { LoginForm } from '@/components/auth/forms/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/forms/ForgotPasswordForm';
import type { ForgotPasswordStep } from '@/components/auth/forms/ForgotPasswordForm';
import { PhoneOtpStep } from '@/components/auth/steps/PhoneOtpStep';
import { CompleteProfileStep } from '@/components/auth/steps/CompleteProfileStep';
import { ApiError } from '@/lib/api';
import { authType } from '@/lib/auth/typography';

type RegisterStep = 'phone-otp' | 'complete-profile';
type LoginMethod = 'email' | 'phone';

interface AuthScreenProps {
  mode: AuthMode;
  initialPhone?: string;
}

const FORGOT_COPY: Record<
  ForgotPasswordStep,
  { title: string; subtitle: string }
> = {
  email: {
    title: 'Forgot Password',
    subtitle: 'Enter your email and we will send you a reset code',
  },
  otp: {
    title: 'Enter Verification Code',
    subtitle: 'Check your email for the 6-digit code',
  },
  reset: {
    title: 'Reset Password',
    subtitle: 'Choose a new password for your account',
  },
  success: {
    title: 'Password Updated',
    subtitle: 'Your password has been reset successfully',
  },
};

export function AuthScreen({ mode, initialPhone }: AuthScreenProps) {
  const [registerStep, setRegisterStep] = useState<RegisterStep>(
    initialPhone ? 'complete-profile' : 'phone-otp',
  );
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('email');

  let title = mode === 'login' ? 'Welcome Back' : 'Create Your Account';
  let subtitle =
    mode === 'login'
      ? loginMethod === 'email'
        ? 'Enter your email and password to continue'
        : 'Enter your phone number to login'
      : 'Enter your phone number to get started';

  if (mode === 'forgot-password') {
    title = FORGOT_COPY[forgotStep].title;
    subtitle = FORGOT_COPY[forgotStep].subtitle;
  } else if (mode === 'register') {
    if (registerStep === 'complete-profile') {
      title = 'Complete Your Profile';
      subtitle = 'Your phone is verified. Finish setting up your account.';
    } else if (registerOtpSent) {
      title = 'Enter Verification Code';
      subtitle = phone
        ? `We've sent a 6-digit code to ${phone}`
        : 'Enter the 6-digit code sent to your phone';
    } else {
      title = 'Create Your Account';
      subtitle = 'Enter your phone number to get started';
    }
  }

  const flowKey =
    mode === 'login'
      ? `login-${loginMethod}`
      : mode === 'forgot-password'
        ? `forgot-${forgotStep}`
        : registerStep === 'complete-profile'
          ? 'register-onboarding'
          : registerOtpSent
            ? 'register-otp'
            : 'register-phone';

  async function handleRegisterOtpVerified(mobile: string) {
    setPhone(mobile);
    setRegisterStep('complete-profile');
  }

  async function handleCompleteProfile(_values: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) {
    setRegisterError(null);
    throw new ApiError(501, 'Account creation will use Cognito. Not wired yet.');
  }

  return (
    <AuthCard flowKey={flowKey}>
      <AuthFlowTransition
        flowKey={flowKey}
        playInitial
        className="flex flex-col gap-8"
      >
        <AuthHeader title={title} subtitle={subtitle} />

        {mode === 'login' ? (
          <LoginForm
            loginMethod={loginMethod}
            onLoginMethodChange={setLoginMethod}
          />
        ) : mode === 'forgot-password' ? (
          <ForgotPasswordForm onStepChange={setForgotStep} />
        ) : registerStep === 'phone-otp' ? (
          <PhoneOtpStep
            onVerified={handleRegisterOtpVerified}
            submitLabel="Verify & Continue"
            onPhaseChange={(phase, mobile) => {
              setRegisterOtpSent(phase === 'otp');
              if (mobile) setPhone(mobile);
            }}
          />
        ) : (
          <>
            {registerError && (
              <p className={authType.error} role="alert">
                {registerError}
              </p>
            )}
            <CompleteProfileStep
              onSubmit={async (values) => {
                try {
                  await handleCompleteProfile(values);
                } catch (err) {
                  setRegisterError(
                    err instanceof ApiError ? err.message : 'Registration failed.',
                  );
                  throw err;
                }
              }}
            />
          </>
        )}

        {mode === 'login' ? (
          <AuthFooter variant="signup" />
        ) : mode === 'forgot-password' ? null : (
          <div className="flex items-center justify-center gap-2 py-1 text-center">
            <span className={authType.bodyM}>Already have an account?</span>
            <Link href="/login" className={authType.link}>
              Log In
            </Link>
          </div>
        )}
      </AuthFlowTransition>
    </AuthCard>
  );
}
