import { headers } from 'next/headers';
import { AuthScreen } from '@/components/auth/AuthScreen';
import type { Portal } from '@/types/auth';

interface RegisterPageProps {
  searchParams: Promise<{ phone?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const headerList = await headers();
  const portal = (headerList.get('x-nivarak-portal') ?? 'consumer') as Portal;
  const params = await searchParams;

  return (
    <AuthScreen
      portal={portal}
      mode="register"
      initialPhone={params.phone}
    />
  );
}
