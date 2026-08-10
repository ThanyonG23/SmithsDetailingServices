/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Inspection photos are resized client-side, but allow generous server
    // action bodies so uploads never hit the 1MB default limit.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
