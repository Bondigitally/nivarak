import { fetchAuthSession } from "aws-amplify/auth";
import { decodeJwtPayload, getRolesFromJwtPayload } from "@/lib/auth/jwt";

export async function getCognitoAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  } catch {
    return null;
  }
}

export async function getCognitoAuthRoles(): Promise<string[]> {
  const accessToken = await getCognitoAccessToken();
  if (!accessToken) return [];
  return getRolesFromJwtPayload(decodeJwtPayload(accessToken));
}
