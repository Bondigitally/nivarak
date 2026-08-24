'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { AuthCheckbox } from '@/components/auth/primitives/AuthCheckbox';
import { AuthField, AuthFieldError } from '@/components/auth/primitives/AuthField';
import { ApiError } from '@/lib/api';
import { typo } from '@/lib/tokens/typography';
import { passwordSchema } from '@/lib/auth/password';

const schema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: passwordSchema,
    agreeToTerms: z.boolean(),
  })
  .refine((data) => data.agreeToTerms, {
    message: 'You must agree to the terms',
    path: ['agreeToTerms'],
  });

type FormValues = z.infer<typeof schema>;

interface CompleteProfileStepProps {
  defaultName?: string;
  onSubmit: (values: FormValues) => Promise<void>;
}

export function CompleteProfileStep({
  defaultName = '',
  onSubmit,
}: CompleteProfileStepProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultName,
      email: '',
      password: '',
      agreeToTerms: false,
    },
    mode: 'onChange',
  });

  async function handleFormSubmit(values: FormValues) {
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed.');
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex w-full flex-col gap-1">
      <AuthField
        id="fullName"
        label="Full name"
        placeholder="Enter your full name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

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
        <AuthCheckbox
          id="agreeToTerms"
          className="items-start"
          label={
            <>
              I agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className={typo.link}
                onClick={(event) => event.stopPropagation()}
              >
                Terms & Conditions
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={typo.link}
                onClick={(event) => event.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </>
          }
          {...register('agreeToTerms')}
        />
        <AuthFieldError />
      </div>

      {error && (
        <p className={typo.error} role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="cta" className="w-full" loading={isSubmitting} disabled={!isValid}>
        Create Account
      </Button>
    </form>
  );
}
