import { ProtectedAppShell } from "./protected-app-shell";
import { BookVisitModal } from "@/features/appointments/components/BookVisitModal";
import { InviteCaregiverDialog } from "@/features/care-team/components/InviteCaregiverDialog";

/**
 * Protected route layout.
 *
 * Global dialogs (BookVisitModal, InviteCaregiverDialog) are mounted here so
 * any child page can open them via store/context without prop drilling.
 * They stay mounted across page navigations, keeping animation state intact.
 */
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
