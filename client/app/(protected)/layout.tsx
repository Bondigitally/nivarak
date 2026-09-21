import { ProtectedAppShell } from "./protected-app-shell";
import { BookVisitModal } from "@/features/appointments/components/BookVisitModal";
import { InviteCaregiverDialog } from "@/features/care-team/components/InviteCaregiverDialog";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedAppShell
      dialogs={
        <>
          <BookVisitModal />
          <InviteCaregiverDialog />
        </>
      }
    >
      {children}
    </ProtectedAppShell>
  );
}
