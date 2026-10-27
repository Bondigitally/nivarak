import type { Context } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';

/**
 * Picks the address used as the rate-limit key.
 *
 * `X-Forwarded-For` is appended to by every proxy, so only the entries added
 * by proxies we operate can be trusted. With `trustedHops` proxies in front of
 * the API, the trusted client address is the entry that many positions from the
 * right; anything the caller put further left is ignored. With zero trusted
 * hops the forwarding headers are ignored and the socket address is used.
 */
export function resolveClientIp(input: {
  forwardedFor: string | undefined;
  realIp: string | undefined;
  socketAddress: string | undefined;
  trustedHops: number;
}): string {
  const { forwardedFor, realIp, socketAddress, trustedHops } = input;

  if (trustedHops > 0) {
    const chain = (forwardedFor ?? '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (chain.length > 0) {
      return chain[Math.max(0, chain.length - trustedHops)];
    }
    if (realIp) return realIp.trim();
  }

  return socketAddress || 'unknown';
}

function socketAddressOf(c: Context): string | undefined {
  try {
    return getConnInfo(c).remote.address;
  } catch {
    return undefined;
  }
}

export function clientIpOf(c: Context, trustedHops: number): string {
  return resolveClientIp({
    forwardedFor: c.req.header('x-forwarded-for'),
    realIp: c.req.header('x-real-ip'),
    socketAddress: socketAddressOf(c),
    trustedHops,
  });
}
