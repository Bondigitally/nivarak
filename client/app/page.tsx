"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-dash-pad-x py-16">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Nivarak
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Assess elderly independence and manage care with a calm, clinical
          experience.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/login">Log In</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/register">Sign Up</Link>
        </Button>
        <Button asChild variant="primary-outline">
          <Link href="/iasp-assessment">IAS Assessment</Link>
        </Button>
      </div>
    </main>
  );
}
