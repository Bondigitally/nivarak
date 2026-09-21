import { RoleAwareAppShell } from "@/components/layout/role-aware-app-shell";
import { BookVisitModal } from "@/features/appointments/components/BookVisitModal";
import { InviteCaregiverDialog } from "@/features/care-team/components/InviteCaregiverDialog";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleAwareAppShell
      dialogs={
        <>
          <BookVisitModal />
          <InviteCaregiverDialog />
        </>
      }
    >
      {children}
    </RoleAwareAppShell>
  );
}
