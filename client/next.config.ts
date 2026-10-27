import type { NextConfig } from 'next';

/**
 * Headers that apply everywhere. The directives below cannot break page
 * scripts, styles, or the Razorpay frame, and they close injection routes
 * (framing, <base> hijacking, form retargeting) that could expose the
 * assessment access tokens kept in browser storage.
 */
const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    /** Include 2560/3840 so full-bleed retina/4K heroes can pick a crisp srcset entry */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    /** Next 16+ allowlist — hero slideshow uses 90 for near-lossless AVIF/WebP */
    qualities: [75, 90, 100],
  },
  async headers() {
    return [
      { source: '/:path*', headers: baseSecurityHeaders },
      {
        source: '/((?!iasp-assessment).*)',
        headers: [{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }],
      },
      {
        // The report URL carries the session id, so it never leaves in a Referer header.
        source: '/iasp-assessment/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
