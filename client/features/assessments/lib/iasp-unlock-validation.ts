import { z } from "zod";
import { isValidPhoneNumber } from "@/features/auth/components/primitives/PhoneField";
import { getDefaultCountry } from "@/features/auth/lib/country-codes";

export const iaspUnlockReportFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(255, "Name must be at least 2 characters"),
  phoneNumber: z.string().superRefine((value, ctx) => {
    const dialCode = getDefaultCountry().dialCode;
    if (!value || value === dialCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone number is required",
      });
      return;
    }
    if (!isValidPhoneNumber(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid mobile number",
      });
    }
  }),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type IaspUnlockFormValues = z.infer<typeof iaspUnlockReportFormSchema>;

export type IaspUnlockFormErrors = Partial<
  Record<keyof IaspUnlockFormValues, string>
>;

export function validateIaspUnlockForm(values: IaspUnlockFormValues):
  | { success: true; data: IaspUnlockFormValues }
  | { success: false; errors: IaspUnlockFormErrors } {
  const result = iaspUnlockReportFormSchema.safeParse(values);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: IaspUnlockFormErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key as keyof IaspUnlockFormValues]) {
      errors[key as keyof IaspUnlockFormValues] = issue.message;
    }
  }
  return { success: false, errors };
}
