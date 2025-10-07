import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    // domains: ['localhost','lh3.googleusercontent.com','platform-lookaside.fbsbx.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.5',
        port: '3005',
        pathname: '/storage-data/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.12',
        port: '3005',
        pathname: '/storage-data/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3005',
        pathname: '/storage-data/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
