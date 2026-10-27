import { describe, expect, it } from 'vitest';

import { resolveClientIp } from '../../middleware/client-ip.js';

describe('resolveClientIp', () => {
  it('ignores a spoofed left-most forwarded address behind one trusted proxy', () => {
    const ip = resolveClientIp({
      forwardedFor: '6.6.6.6, 203.0.113.9',
      realIp: undefined,
      socketAddress: '10.0.0.2',
      trustedHops: 1,
    });
    expect(ip).toBe('203.0.113.9');
  });

  it('counts back from the right for two trusted proxies', () => {
    const ip = resolveClientIp({
      forwardedFor: '6.6.6.6, 203.0.113.9, 10.1.1.1',
      realIp: undefined,
      socketAddress: '10.0.0.2',
      trustedHops: 2,
    });
    expect(ip).toBe('203.0.113.9');
  });

  it('uses the socket address when no proxy is trusted', () => {
    const ip = resolveClientIp({
      forwardedFor: '6.6.6.6',
      realIp: '7.7.7.7',
      socketAddress: '198.51.100.4',
      trustedHops: 0,
    });
    expect(ip).toBe('198.51.100.4');
  });

  it('falls back to the socket address when the proxy header is missing', () => {
    const ip = resolveClientIp({
      forwardedFor: undefined,
      realIp: undefined,
      socketAddress: '198.51.100.4',
      trustedHops: 1,
    });
    expect(ip).toBe('198.51.100.4');
  });
});
