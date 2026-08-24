'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { AuthField } from '@/components/auth/primitives/AuthField';
import { OtpInput } from '@/components/auth/primitives/OtpInput';
import {
  ApiError,
} from '@/lib/api';
import { typo } from '@/lib/tokens/typography';
import { passwordSchema } from '@/lib/auth/password';
import { cn } from '@/lib/utils';

export type ForgotPasswordStep = 'email' | 'otp' | 'reset' | 'success';

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type EmailValues = z.infer<typeof emailSchema>;
type ResetValues = z.infer<typeof resetSchema>;

// TEMP MOCK — fixed code for /dev/forgot-otp. Remove with uiMock when API is wired.
const UI_MOCK_RESET_CODE = '123456';

interface ForgotPasswordFormProps {
  onStepChange?: (step: ForgotPasswordStep) => void;
  /**
   * TEMP MOCK — skip API calls. Remove when auth is wired.
   */
  uiMock?: boolean;
  /**
   * TEMP MOCK — jump straight to a step (e.g. "otp"). Remove when auth is wired.
   */
  initialStep?: ForgotPasswordStep;
}

function BackToLoginLink({ className }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 self-center',
        typo.bodyM,
        'text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
    >
      <HugeiconsIcon
        icon={ArrowLeft01Icon}
        size={16}
        strokeWidth={1.5}
        className="shrink-0"
      />
      <span className="leading-none">Back to login</span>
    </Link>
  );
}

export function ForgotPasswordForm({
  onStepChange,
  uiMock = false,
  initialStep = 'email',
}: ForgotPasswordFormProps) {
  const [step, setStep] = useState<ForgotPasswordStep>(initialStep);
  const [email, setEmail] = useState(uiMock ? 'you@example.com' : '');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | null>(
    uiMock && initialStep === 'otp' ? UI_MOCK_RESET_CODE : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  function goTo(next: ForgotPasswordStep) {
    setStep(next);
    onStepChange?.(next);
  }

  async function handleSendCode(values: EmailValues) {
    setError(null);
    setLoading(true);
    try {
      // TEMP MOCK — bypass forgotPassword API
      if (uiMock) {
        setEmail(values.email);
        setDevCode(UI_MOCK_RESET_CODE);
        setOtp('');
        goTo('otp');
        return;
      }

      throw new ApiError(501, 'Password reset will use Cognito. Not wired yet.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      // TEMP MOCK — accept UI_MOCK_RESET_CODE only
      if (uiMock) {
        if (otp !== UI_MOCK_RESET_CODE) {
          setError(`Use mock code ${UI_MOCK_RESET_CODE}`);
          return;
        }
        goTo('reset');
        return;
      }

      throw new ApiError(501, 'Password reset will use Cognito. Not wired yet.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(values: ResetValues) {
    setError(null);
    setLoading(true);
    try {
      // TEMP MOCK — skip resetPassword API
      if (uiMock) {
        goTo('success');
        return;
      }

      throw new ApiError(501, 'Password reset will use Cognito. Not wired yet.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setLoading(true);
    try {
      // TEMP MOCK — bypass forgotPassword API
      if (uiMock) {
        setDevCode(UI_MOCK_RESET_CODE);
        setOtp('');
        return;
      }

      throw new ApiError(501, 'Password reset will use Cognito. Not wired yet.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="flex w-full flex-col items-center gap-6">
        <p className={cn(typo.bodyL, 'w-full text-center')}>
          Your password has been updated. You can now log in with your new password.
        </p>
        <BackToLoginLink />
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="flex w-full flex-col gap-6">
        <form
          onSubmit={resetForm.handleSubmit(handleResetPassword)}
          className="flex w-full flex-col gap-1"
        >
          <AuthField
            id="password"
            label="New password"
            type="password"
            error={resetForm.formState.errors.password?.message}
            {...resetForm.register('password')}
          />
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            error={resetForm.formState.errors.confirmPassword?.message}
            {...resetForm.register('confirmPassword')}
          />

          {error && (
            <p className={typo.error} role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="cta" className="w-full" loading={loading}>
            Reset Password
          </Button>
        </form>

        <BackToLoginLink />
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="flex w-full flex-col gap-6">
        <p className={typo.bodyM}>
          We sent a 6-digit code to <span className="text-foreground">{email}</span>
        </p>

        {devCode && (
          <p className={cn(typo.bodyS, 'rounded-[14px] border border-border bg-muted px-3 py-2')}>
            Dev code: <span className="font-medium text-foreground">{devCode}</span>
          </p>
        )}

        <div className="flex w-full flex-col gap-1">
          <div className="flex flex-col gap-2">
            <span className={typo.label}>Verification code</span>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} error={error ?? undefined} />
          </div>
          <Button
            type="button"
            size="cta"
            className="w-full"
            loading={loading}
            onClick={handleVerifyOtp}
          >
            Verify Code
          </Button>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2 text-center">
            <span className={typo.bodyM}>Didn&apos;t get a code?</span>
            <button
              type="button"
              className={`${typo.link} disabled:opacity-50`}
              disabled={loading}
              onClick={handleResend}
            >
              Resend
            </button>
          </div>
          <BackToLoginLink />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <form
        onSubmit={emailForm.handleSubmit(handleSendCode)}
        className="flex w-full flex-col gap-1"
      >
        <AuthField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={emailForm.formState.errors.email?.message}
          {...emailForm.register('email')}
        />

        {error && (
          <p className={typo.error} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="cta" className="w-full" loading={loading}>
          Send Reset Code
        </Button>
      </form>

      <BackToLoginLink />
    </div>
  );
}
