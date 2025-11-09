import type { NextConfig } from "next";

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rlfuwzyipldnuesvfyja.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
} as NextConfig;
