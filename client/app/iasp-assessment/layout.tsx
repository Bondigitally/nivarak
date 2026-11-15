import type { ReactNode } from "react";

/** Public IAS-P assessment — always light, like auth and marketing. */
export default function IaspAssessmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="auth-light-mode min-h-screen">{children}</div>;
}
