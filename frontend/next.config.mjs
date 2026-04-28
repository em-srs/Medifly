/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress served assets
  compress: true,

  // Webpack config (used only in `next build`, not during dev with --turbo)
  webpack(config, { isServer }) {
    if (!isServer) {
      // Prevent Node built-ins being bundled to the client
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
};

export default nextConfig;
