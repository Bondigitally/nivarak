import { isValidPhoneNumber } from "@/features/auth/components/primitives/PhoneField";
import { z } from "zod";

export const RELATIONSHIP_VALUES = [
  "son-daughter",
  "spouse",
  "self",
  "other",
] as const;

export const SCORE_FOR_VALUES = ["self", "parent", "spouse", "other"] as const;

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(80, "Name is too long")
  .regex(/^[\p{L}][\p{L}\s'.-]*$/u, "Please enter a valid name");

const emailSchema = z
  .string()
  .trim()
  .min(1, "Please enter a valid email address")
  .email("Please enter a valid email address")
  .max(254, "Email is too long");

const phoneSchema = z
  .string()
  .trim()
  .refine(isValidPhoneNumber, "Please enter a valid phone number");

const requiredMessageSchema = z
  .string()
  .trim()
  .min(10, "Please add a short message or preferred time (at least 10 characters)")
  .max(1000, "Message is too long");

const optionalMessageSchema = z
  .string()
  .trim()
  .max(1000, "Message is too long");

const optionalCitySchema = z
  .string()
  .trim()
  .max(80, "City name is too long")
  .refine(
    (value) => value === "" || /^[\p{L}][\p{L}\s'.-]*$/u.test(value),
    "Please enter a valid city name",
  );

const ageSchema = z
  .string()
  .trim()
  .min(1, "Please enter an age")
  .refine((value) => /^\d+$/.test(value), "Please enter a whole number")
  .transform((value) => Number(value))
  .pipe(
    z
      .number()
      .int("Please enter a whole number")
      .min(40, "Age must be at least 40")
      .max(120, "Please enter a valid age"),
  );

function oneOf<T extends readonly string[]>(
  values: T,
  message: string,
) {
  return z
    .string()
    .refine(
      (value): value is T[number] =>
        (values as readonly string[]).includes(value),
      message,
    );
}

export const contactFormSchema = z.object({
  name: personNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  relationship: oneOf(RELATIONSHIP_VALUES, "Please select a relationship"),
  message: requiredMessageSchema,
});

export const scoreCheckFormSchema = z.object({
  name: personNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  scoreFor: oneOf(SCORE_FOR_VALUES, "Please tell us who this is for"),
  age: ageSchema,
  city: optionalCitySchema,
  message: optionalMessageSchema,
});

export const newsletterFormSchema = z.object({
  email: emailSchema,
});

export type FieldErrors = Record<string, string>;

export function validateWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  values: z.input<T>,
):
  | { success: true; data: z.output<T> }
  | { success: false; errors: FieldErrors } {
  const result = schema.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    const field = typeof key === "string" ? key : "_form";
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}

export function focusFirstField(
  form: HTMLFormElement,
  fieldIds: Record<string, string>,
  errorKeys: string[],
) {
  const firstKey = errorKeys[0];
  if (!firstKey) return;

  const id = fieldIds[firstKey];
  if (!id) return;

  requestAnimationFrame(() => {
    const el = form.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    el?.focus();
  });
}
