/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip lint/type errors during builds (CI may enforce separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
