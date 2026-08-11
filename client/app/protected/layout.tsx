import { Sidebar } from "@/components/layout/sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-screen + overflow-hidden: the sidebar and main both scroll independently
    <div className="flex h-screen overflow-hidden bg-[#F8F5FA]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
