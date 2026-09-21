import { redirect } from "next/navigation";

/** Legacy path — prefer `/notifications`. */
export default function AlertsPage() {
  redirect("/notifications");
}
