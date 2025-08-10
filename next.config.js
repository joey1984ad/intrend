/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 14 has app directory enabled by default
  eslint: {
    // Don't block production builds on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't block production builds on TS type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig