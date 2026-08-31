/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
