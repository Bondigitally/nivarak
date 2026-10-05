import { AlertDetailPage } from "@/features/alerts/components/AlertDetailPage";

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlertDetailPage alertId={id} />;
}
