import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F8F5FA] px-6 py-16">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Nivarak</h1>
        <p className="mt-3 text-base text-[#5F6368]">
          Assess elderly independence and manage care with a calm, clinical experience.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="bg-[#6C318E] hover:bg-[#5F2B7D]">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild variant="outline" className="border-[#E9E4ED]">
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    </main>
  );
}
