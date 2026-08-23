import { headers } from 'next/headers';
import { AuthScreen } from '@/components/auth/AuthScreen';
import type { Portal } from '@/types/auth';

export default async function LoginPage() {
  const headerList = await headers();
  const portal = (headerList.get('x-nivarak-portal') ?? 'consumer') as Portal;

  return <AuthScreen portal={portal} mode="login" />;
}
