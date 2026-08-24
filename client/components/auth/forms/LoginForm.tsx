'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HugeiconsIcon } from '@hugeicons/react';
import { Call02Icon, Mail02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { AuthCheckbox } from '@/components/auth/primitives/AuthCheckbox';
import { AuthField } from '@/components/auth/primitives/AuthField';
import { OrDivider } from '@/components/auth/primitives/OrDivider';
import { PhoneOtpStep } from '@/components/auth/steps/PhoneOtpStep';
import { ApiError } from '@/lib/api';
import { authType } from '@/lib/auth/typography';
import { loginPasswordSchema } from '@/lib/auth/password';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleCredentialsSubmit(_: CredentialsValues) {
    setError(null);
    setError(
      'Email sign-in is coming soon. Continue with phone number to log in.',
    );
  }

  async function handlePhoneOtpVerified(_phone: string, _otp: string) {
    throw new ApiError(501, 'Sign in will use Cognito. Not wired yet.');
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
        <HugeiconsIcon icon={Mail02Icon} size={20} strokeWidth={1.5} />
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
        <HugeiconsIcon icon={Call02Icon} size={20} strokeWidth={1.5} />
        Continue with Phone Number
      </Button>
    );

  return (
    <>
      {loginMethod === 'phone' ? (
        <div className="flex w-full flex-col gap-8">
          <PhoneOtpStep
            onVerified={handlePhoneOtpVerified}
            submitLabel="Log In"
            initialPhone={phone || undefined}
            initialOtpSent={phoneOtpSent}
            onPhaseChange={onPhoneOtpPhaseChange}
          />

          {!phoneOtpSent && <OrDivider>{secondaryActions}</OrDivider>}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-8">
          <form
            onSubmit={handleSubmit(handleCredentialsSubmit)}
            className="flex w-full flex-col gap-6"
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

            <div className="flex items-center justify-between">
              <AuthCheckbox id="rememberMe" label="Remember me" {...register('rememberMe')} />
              <Link href="/forgot-password" className={authType.link}>
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className={authType.error} role="alert">
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
