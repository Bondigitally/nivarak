import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F5FA] px-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
      <p className="text-[#5F6368]">You are signed in. App shell coming soon.</p>
      <Link href="/login" className="text-sm text-[#6C318E] hover:underline">
        Back to login
      </Link>
    </main>
  );
}
