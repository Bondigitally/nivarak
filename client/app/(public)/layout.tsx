export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="border-b p-4 font-semibold text-indigo-600">Layout: (public)</header>
      <main className="p-8">{children}</main>
    </div>
  );
}
