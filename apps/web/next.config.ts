import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental: {
    optimizePackageImports: ["@radix-ui/react-*"],
  },
}

export default config
