import { apiFetch } from "@/lib/api";

export type SubmitContactInquiryInput = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export type ContactInquiryCreated = {
  id: string;
  createdAt: string;
};

export function submitContactInquiry(
  input: SubmitContactInquiryInput,
): Promise<ContactInquiryCreated> {
  return apiFetch<ContactInquiryCreated>("/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
