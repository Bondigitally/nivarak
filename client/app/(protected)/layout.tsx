export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="protected-shell min-h-screen bg-[#F8F5FA] font-sans">
      <main
        data-dashboard-scroll
        className="min-h-screen overflow-y-auto overscroll-y-contain"
      >
        {children}
      </main>
    </div>
  );
}
