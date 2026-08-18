'use client';

import { useState, type ReactNode } from 'react';
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

type RegisterStep = 'phone' | 'otp' | 'complete-profile';
type LoginMethod = 'email' | 'phone';

interface AuthScreenProps {
  mode: AuthMode;
  initialPhone?: string;
}

function otpOnPhoneSubtitle(phone: string): ReactNode {
  return (
    <>
      We&apos;ve sent a 6-digit OTP on{' '}
      <span className="text-foreground">{phone}</span>
    </>
  );
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
    initialPhone ? 'complete-profile' : 'phone',
  );
  const [phone, setPhone] = useState(initialPhone ?? '');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('email');

  let title: string = mode === 'login' ? 'Welcome Back' : 'Create Your Account';
  let subtitle: ReactNode =
    mode === 'login'
      ? loginMethod === 'email'
        ? 'Enter your email and password to continue'
        : 'Enter your phone number to login'
      : 'Enter your phone number to get started';

  if (mode === 'login' && loginOtpSent) {
    title = 'Enter Verification Code';
    subtitle = loginPhone
      ? otpOnPhoneSubtitle(loginPhone)
      : 'Enter the 6-digit OTP sent to your phone';
  } else if (mode === 'forgot-password') {
    title = FORGOT_COPY[forgotStep].title;
    subtitle = FORGOT_COPY[forgotStep].subtitle;
  } else if (mode === 'register') {
    if (registerStep === 'complete-profile') {
      title = 'Complete Your Profile';
      subtitle = 'Your phone is verified. Finish setting up your account.';
    } else if (registerStep === 'otp') {
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
      ? loginOtpSent
        ? 'login-otp'
        : `login-${loginMethod}`
      : mode === 'forgot-password'
        ? `forgot-${forgotStep}`
        : `register-${registerStep}`;

  async function handleRegisterOtpVerified(mobile: string) {
    setPhone(mobile);
    setRegisterStep('complete-profile');
  }

  async function handleCompleteProfile(_values: {
    fullName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
  }) {
    throw new ApiError(501, 'Account creation will use Cognito. Not wired yet.');
  }

  return (
    <AuthCard flowKey={flowKey}>
      <AuthFlowTransition
        flowKey={flowKey}
        playInitial
        className="flex flex-col gap-auth-stack"
      >
        <AuthHeader title={title} subtitle={subtitle} />

        {mode === 'login' ? (
          <LoginForm
            loginMethod={loginMethod}
            onLoginMethodChange={setLoginMethod}
            phoneOtpSent={loginOtpSent}
            phone={loginPhone}
            onPhoneOtpPhaseChange={(phase, mobile) => {
              setLoginOtpSent(phase === 'otp');
              if (mobile) setLoginPhone(mobile);
            }}
          />
        ) : mode === 'forgot-password' ? (
          <ForgotPasswordForm onStepChange={setForgotStep} />
        ) : registerStep === 'complete-profile' ? (
          <CompleteProfileStep onSubmit={handleCompleteProfile} />
        ) : (
          <PhoneOtpStep
            onVerified={handleRegisterOtpVerified}
            submitLabel="Verify & Continue"
            initialPhone={phone || undefined}
            initialOtpSent={registerStep === 'otp'}
            onPhaseChange={(phase, mobile) => {
              setRegisterStep(phase === 'otp' ? 'otp' : 'phone');
              if (mobile) setPhone(mobile);
            }}
          />
        )}

        {((mode === 'login' && loginOtpSent) ||
        (mode === 'register' && registerStep === 'otp') ||
        mode === 'forgot-password') ? null : (
          <AuthFooter variant={mode === 'login' ? 'signup' : 'login'} />
        )}
      </AuthFlowTransition>
    </AuthCard>
  );
}
