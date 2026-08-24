import { z } from 'zod';

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    message: 'Password must be at least 8 characters.',
    test: (value: string) => value.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    message: 'Password must contain an uppercase letter.',
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'At least one number',
    message: 'Password must contain a number.',
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'At least one special character',
    message: 'Password must contain a special character.',
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]['id'];

export type PasswordRuleResult = {
  id: PasswordRuleId;
  label: string;
  message: string;
  met: boolean;
};

export function evaluatePasswordRules(value: string): PasswordRuleResult[] {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    message: rule.message,
    met: value.length > 0 && rule.test(value),
  }));
}

export function countMetPasswordRules(value: string): number {
  return evaluatePasswordRules(value).filter((rule) => rule.met).length;
}

export function isPasswordStrong(value: string): boolean {
  return value.length > 0 && PASSWORD_RULES.every((rule) => rule.test(value));
}

/** Shared password rules — used for create / reset (strength UI shows details) */
export const passwordSchema = z.string().superRefine((value, ctx) => {
  if (!value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter your password',
    });
    return;
  }

  const failed = PASSWORD_RULES.filter((rule) => !rule.test(value)).map(
    (rule) => rule.message,
  );

  if (failed.length === 0) return;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: failed.join('\n'),
  });
});

/** Login only needs a non-empty password */
export const loginPasswordSchema = z
  .string()
  .min(1, 'Please enter your password');
