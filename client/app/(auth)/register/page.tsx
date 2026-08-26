import { AuthScreen } from '@/features/auth/components/AuthScreen';

interface RegisterPageProps {
  searchParams: Promise<{ phone?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return <AuthScreen mode="register" initialPhone={params.phone} />;
}
