'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, Mail02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { AuthCheckbox } from '@/features/auth/components/primitives/AuthCheckbox';
import { AuthField, AuthFieldError } from '@/features/auth/components/primitives/AuthField';
import { OrDivider } from '@/features/auth/components/primitives/OrDivider';
import { PhoneOtpStep } from '@/features/auth/components/steps/PhoneOtpStep';
import { useRouter } from 'next/navigation';
import { typo } from '@/lib/tokens/typography';
import { loginPasswordSchema } from '@/features/auth/lib/password';
import {
  confirmLoginPhoneOtp,
  getSignInErrorMessage,
  sendLoginPhoneOtp,
  signInWithEmailPassword,
} from '@/features/auth/lib/cognito';

const credentialsSchema = z.object({
  email: z
    .string()
    .min(1, 'Please enter your email address')
    .email('Enter a valid email address'),
  password: loginPasswordSchema,
  rememberMe: z.boolean().optional(),
});

type CredentialsValues = z.infer<typeof credentialsSchema>;
type LoginMethod = 'email' | 'phone';

interface LoginFormProps {
  loginMethod: LoginMethod;
  onLoginMethodChange: (method: LoginMethod) => void;
  phoneOtpSent?: boolean;
  phone?: string;
  onPhoneOtpPhaseChange?: (phase: 'phone' | 'otp', phone: string) => void;
}

export function LoginForm({
  loginMethod,
  onLoginMethodChange,
  phoneOtpSent = false,
  phone,
  onPhoneOtpPhaseChange,
}: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CredentialsValues>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { rememberMe: false },
    mode: 'onChange',
  });

  useEffect(() => {
    onLoginMethodChange(loginMethod);
  }, [loginMethod, onLoginMethodChange]);

  async function handleCredentialsSubmit(values: CredentialsValues) {
    setError(null);
    try {
      const { isSignedIn, nextStep } = await signInWithEmailPassword(
        values.email,
        values.password,
      );
      if (isSignedIn) {
        router.push('/dashboard');
        return;
      }
      setError(`Sign-in needs another step: ${nextStep.signInStep}`);
    } catch (err) {
      setError(getSignInErrorMessage(err));
    }
  }

  async function handlePhoneOtpSend(mobile: string) {
    await sendLoginPhoneOtp(mobile);
  }

  async function handlePhoneOtpVerified(_phone: string, otp: string) {
    await confirmLoginPhoneOtp(otp);
    router.push('/dashboard');
  }

  const secondaryActions =
    loginMethod === 'phone' ? (
      <Button
        type="button"
        variant="primary-outline"
        size="cta"
        className="w-full"
        onClick={() => onLoginMethodChange('email')}
      >
        <HugeiconsIcon icon={Mail02Icon} size={19} strokeWidth={1.75} />
        Continue with Email
      </Button>
    ) : (
      <Button
        type="button"
        variant="primary-outline"
        size="cta"
        className="w-full"
        onClick={() => onLoginMethodChange('phone')}
      >
        <HugeiconsIcon icon={Call02Icon} size={19} strokeWidth={1.75} />
        Continue with Phone Number
      </Button>
    );

  return (
    <>
      {loginMethod === 'phone' ? (
        <div className="flex w-full flex-col gap-6">
          <PhoneOtpStep
            onSendOtp={handlePhoneOtpSend}
            onVerified={handlePhoneOtpVerified}
            submitLabel="Log In"
            initialPhone={phone || undefined}
            initialOtpSent={phoneOtpSent}
            onPhaseChange={onPhoneOtpPhaseChange}
          />

          {!phoneOtpSent && <OrDivider>{secondaryActions}</OrDivider>}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-6">
          <form
            onSubmit={handleSubmit(handleCredentialsSubmit)}
            className="flex w-full flex-col gap-1"
          >
            <AuthField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />

            <AuthField
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex w-full flex-col">
              <div className="flex items-center justify-between">
                <AuthCheckbox id="rememberMe" label="Remember me" {...register('rememberMe')} />
                <Link href="/forgot-password" className={typo.link}>
                  Forgot password?
                </Link>
              </div>
              <AuthFieldError />
            </div>

            {error && (
              <p className={typo.error} role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="cta" className="w-full" loading={isSubmitting} disabled={!isValid}>
              Log In
            </Button>
          </form>

          <OrDivider>{secondaryActions}</OrDivider>
        </div>
      )}
    </>
  );
}
