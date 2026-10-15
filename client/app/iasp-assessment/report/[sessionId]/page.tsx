import type { Metadata } from "next";
import { IaspDetailedReportPage } from "@/features/assessments/components/IaspDetailedReportPage";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata: Metadata = {
  title: "IASP Assessment Report PDF | Nivarak",
  description:
    "Downloadable Independent Ageing Score (Proxy) assessment report with domain scores, red flags, and care pathway.",
}

export default async function IaspAssessmentReportPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <IaspDetailedReportPage sessionId={sessionId} />;
}
