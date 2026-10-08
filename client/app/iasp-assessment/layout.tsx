"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Public IAS-P assessment — always light, like auth and marketing.
 *
 * `auth-light-mode` opts this route out of `html.dark` token overrides in
 * globals.css (same mechanism as login/register).
 */
export default function IaspAssessmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return <div className="auth-light-mode min-h-screen">{children}</div>;
}
