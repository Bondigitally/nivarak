import { headers } from 'next/headers';
import Link from 'next/link';
import type { Portal } from '@/types/auth';
import { PORTALS } from '@/lib/auth/portals';

export default async function DashboardPage() {
  const headerList = await headers();
  const portal = (headerList.get('x-nivarak-portal') ?? 'consumer') as Portal;
  const config = PORTALS[portal];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F5FA] px-6">
      <p className="text-sm font-medium text-[#6C318E]">
        {config.badge ?? 'Consumer portal'}
      </p>
      <h1 className="text-2xl font-bold text-[#1A1A1A]">Dashboard</h1>
      <p className="text-[#5F6368]">You are signed in. App shell coming soon.</p>
      <Link href="/login" className="text-sm text-[#6C318E] hover:underline">
        Back to login
      </Link>
    </main>
  );
}
