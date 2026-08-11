'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { AuthCheckbox } from '@/components/auth/primitives/AuthCheckbox';
import { AuthField } from '@/components/auth/primitives/AuthField';
import { PasswordStrength } from '@/components/auth/primitives/PasswordStrength';
import type { PortalConfig } from '@/lib/auth/portals';
import { ApiError } from '@/lib/api';
import { authType } from '@/lib/auth/typography';
import { passwordSchema } from '@/lib/auth/password';

function buildSchema(requireTerms: boolean) {
  return z
    .object({
      fullName: z.string().min(2, 'Enter your full name'),
      email: z.string().email('Enter a valid email address'),
      password: passwordSchema,
      confirmPassword: z.string().min(1, 'Confirm your password'),
      agreeToTerms: z.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
    .refine((data) => !requireTerms || data.agreeToTerms, {
      message: 'You must agree to the terms',
      path: ['agreeToTerms'],
    });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

interface CompleteProfileStepProps {
  portal: PortalConfig;
  defaultName?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function CompleteProfileStep({
  portal,
  defaultName = '',
  onSubmit,
}: CompleteProfileStepProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(buildSchema(portal.layout === 'split')),
    defaultValues: {
      fullName: defaultName,
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const passwordValue = watch('password');
  const passwordEmptyError =
    errors.password?.message === 'Please enter your password'
      ? errors.password.message
      : undefined;

  async function handleFormSubmit(values: FormValues) {
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed.');
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex w-full flex-col gap-6">
      <AuthField
        id="fullName"
        label="Full name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <AuthField
        id="email"
        label={portal.emailLabel}
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex w-full flex-col gap-3">
        <AuthField
          id="password"
          label="Password"
          type="password"
          error={passwordEmptyError}
          {...register('password')}
        />
        <PasswordStrength
          value={passwordValue ?? ''}
          forceVisible={isSubmitted && !!errors.password}
        />
      </div>

      <AuthField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      {portal.layout === 'split' && (
        <AuthCheckbox
          id="agreeToTerms"
          className="items-start"
          label="I agree to the Terms & Conditions and Privacy Policy"
          {...register('agreeToTerms')}
        />
      )}

      {errors.agreeToTerms && (
        <p className={authType.error}>{errors.agreeToTerms.message}</p>
      )}

      {error && (
        <p className={authType.error} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="cta" className="w-full" loading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
