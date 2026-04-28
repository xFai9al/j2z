/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip X-Powered-By header (minor security + less noise)
  poweredByHeader: false,

  // Enable gzip/brotli compression
  compress: true,

  // Allow Next.js <Image> to load avatars from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jzjyzmizjvlgmsaazfcc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Security & performance headers on every response
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;
