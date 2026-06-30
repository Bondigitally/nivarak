import Link from "next/link";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 border-r p-4">
        <h2 className="mb-4 font-bold">Layout: (protected)</h2>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block text-sm">Dashboard</Link>
          <Link href="/patients" className="block text-sm">Patients</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
