import { AuthScreen } from '@/features/auth/components/AuthScreen';

interface InviteAcceptPageProps {
  searchParams: Promise<{ token?: string; phone?: string }>;
}

export default async function InviteAcceptPage({
  searchParams,
}: InviteAcceptPageProps) {
  const params = await searchParams;

  return <AuthScreen mode="register" initialPhone={params.phone} />;
}
