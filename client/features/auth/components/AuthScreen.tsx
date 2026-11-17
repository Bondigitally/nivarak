'use client';

import { useState, type ReactNode } from 'react';
import { signOut } from 'aws-amplify/auth';
import type { AuthMode } from '@/types/auth';
import { AuthCard } from '@/features/auth/components/layout/AuthCard';
import { AuthHeader } from '@/features/auth/components/primitives/AuthHeader';
import { AuthFooter } from '@/features/auth/components/primitives/AuthFooter';
import { AuthFlowTransition } from '@/features/auth/components/primitives/AuthFlowTransition';
import { LoginForm } from '@/features/auth/components/forms/LoginForm';
import { ForgotPasswordForm } from '@/features/auth/components/forms/ForgotPasswordForm';
import type { ForgotPasswordStep } from '@/features/auth/components/forms/ForgotPasswordForm';
import { PhoneOtpStep } from '@/features/auth/components/steps/PhoneOtpStep';
import { CompleteProfileStep } from '@/features/auth/components/steps/CompleteProfileStep';
import { AccountSuccessStep } from '@/features/auth/components/steps/AccountSuccessStep';
import {
  completeRegisterProfile,
  confirmRegisterPhoneOtp,
  sendRegisterPhoneOtp,
} from '@/features/auth/lib/cognito';

type RegisterStep = 'phone' | 'otp' | 'complete-profile' | 'success';
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
  const [registerStep, setRegisterStep] = useState<RegisterStep>('phone');
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
        : 'Enter your phone number to log in'
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

  async function handleRegisterSendOtp(mobile: string) {
    await sendRegisterPhoneOtp(mobile);
    setPhone(mobile);
  }

  async function handleRegisterOtpVerified(mobile: string, otp: string) {
    await confirmRegisterPhoneOtp(mobile, otp);
    setPhone(mobile);
    setRegisterStep('complete-profile');
  }

  async function handleCompleteProfile(values: {
    fullName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
  }) {
    await completeRegisterProfile({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });
    try {
      await signOut();
    } catch {
      // Session may already be cleared; still show the success step.
    }
    setRegisterStep('success');
  }

  return (
    <AuthCard flowKey={flowKey}>
      <AuthFlowTransition
        flowKey={flowKey}
        playInitial
        className="flex flex-col gap-auth-stack"
      >
        {mode === 'register' && registerStep === 'success' ? (
          <AccountSuccessStep />
        ) : (
          <>
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
                onSendOtp={handleRegisterSendOtp}
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
          </>
        )}
      </AuthFlowTransition>
    </AuthCard>
  );
}
