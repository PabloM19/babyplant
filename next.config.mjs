/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['172.31.48.30'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
