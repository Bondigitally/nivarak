import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    /** Include 2560/3840 so full-bleed retina/4K heroes can pick a crisp srcset entry */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    /** Next 16+ allowlist — hero slideshow uses 90 for near-lossless AVIF/WebP */
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
