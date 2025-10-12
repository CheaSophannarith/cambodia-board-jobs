import type { NextConfig } from "next";

module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
} as NextConfig;
