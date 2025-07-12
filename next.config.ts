/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this images block
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
  },
  // ... you might have other configurations here
};

module.exports = nextConfig;