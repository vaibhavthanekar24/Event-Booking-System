import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Disable linting during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Disable TypeScript errors from blocking build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Output standalone build for better Vercel compatibility
  output: 'standalone',

  // Optimize for Vercel
  experimental: {
    serverComponentsExternalPackages: ['@payloadcms/db-mongodb'],
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
