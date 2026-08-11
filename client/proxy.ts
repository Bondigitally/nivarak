import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPortalFromHost } from '@/lib/auth/portals';

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const portal = getPortalFromHost(host);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nivarak-portal', portal);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('x-nivarak-portal', portal);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
