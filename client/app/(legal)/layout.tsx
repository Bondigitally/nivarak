export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-10 lg:py-16">
        {children}
      </div>
    </main>
  );
}
