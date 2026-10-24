"use client";

import { useRouter } from "next/navigation";
import { IaspAssessmentLauncher } from "@/features/assessments/components/IaspAssessmentLauncher";

/** Empty surface page — assessment modal opens here, not over marketing. */
export default function IaspAssessmentPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-background">
      <IaspAssessmentLauncher onDismiss={() => router.replace("/")} />
    </main>
  );
}
