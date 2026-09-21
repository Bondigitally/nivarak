'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { AuthField } from '@/features/auth/components/primitives/AuthField';
import { OtpInput } from '@/features/auth/components/primitives/OtpInput';
import { OtpResendControl } from '@/features/auth/components/primitives/OtpResendControl';
import { typo } from '@/lib/tokens/typography';
import { passwordSchema } from '@/features/auth/lib/password';
import { cn } from '@/lib/utils';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

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

interface ForgotPasswordFormProps {
  onStepChange?: (step: ForgotPasswordStep) => void;
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
        size={19}
        strokeWidth={1.5}
        className="shrink-0"
      absoluteStrokeWidth />
      <span className="leading-none">Back to login</span>
    </Link>
  );
}

export function ForgotPasswordForm({ onStepChange }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
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
      await resetPassword({ username: values.email });
      setEmail(values.email);
      setOtp('');
      goTo('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code.');
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
    // Code is validated server-side at the confirmResetPassword step
    goTo('reset');
  }

  async function handleResetPassword(values: ResetValues) {
    setError(null);
    setLoading(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: otp,
        newPassword: values.password,
      });
      goTo('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setLoading(true);
    try {
      await resetPassword({ username: email });
      setOtp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
      throw err;
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
          <OtpResendControl
            disabled={loading}
            prompt="Didn't get a code?"
            actionLabel="Resend"
            onResend={handleResend}
          />
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
