// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },

  // This project lives in a OneDrive-synced folder (Desktop), where OneDrive
  // locks/renames files mid-write. That corrupts webpack's on-disk pack cache
  // and spams ENOENT errors for `.next/cache/webpack/*.pack.gz`. Use an
  // in-memory cache during local dev to sidestep it. Production builds (Vercel,
  // Linux) are unaffected and keep the default persistent disk cache.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },
};
