/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,  // ✅ Mudou de true para false
    formats: ['image/webp', 'image/avif'],  // ✅ Novo: formatos modernos
    deviceSizes: [640, 750, 828, 1080, 1200],  // ✅ Novo
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  // ✅ Novo
    minimumCacheTTL: 60,  // ✅ Novo: cache de 60 segundos
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ltjqoxzkkvtxhgyharsm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  outputFileTracingRoot: process.cwd()
}

export default nextConfig
