import { AuthScreen } from '@/components/auth/AuthScreen';

interface RegisterPageProps {
  searchParams: Promise<{ phone?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return <AuthScreen mode="register" initialPhone={params.phone} />;
}
