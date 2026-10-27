import { apiFetch } from "@/lib/api";

export type SubmitBookingInquiryInput = {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredSlotStart?: string;
  preferredSlotEnd?: string;
};

export type BookingInquiryCreated = {
  id: string;
  createdAt: string;
};

export function submitBookingInquiry(
  input: SubmitBookingInquiryInput,
): Promise<BookingInquiryCreated> {
  return apiFetch<BookingInquiryCreated>("/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
