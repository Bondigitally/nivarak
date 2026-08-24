import { z } from 'zod';

export const PASSWORD_RULES = [
  {
    message: 'Password must be at least 8 characters.',
    test: (value: string) => value.length >= 8,
  },
  {
    message: 'Password must contain an uppercase letter.',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    message: 'Password must contain a number.',
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    message: 'Password must contain a special character.',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

/** Shared password rules — used for create / reset */
export const passwordSchema = z.string().superRefine((value, ctx) => {
  if (!value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter your password',
    });
    return;
  }

  const failed = PASSWORD_RULES.find((rule) => !rule.test(value));
  if (!failed) return;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: failed.message,
  });
});

/** Login only needs a non-empty password */
export const loginPasswordSchema = z
  .string()
  .min(1, 'Please enter your password');
