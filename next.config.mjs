/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '@prisma/adapter-mssql', 'mssql', 'tedious'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const NODE_EXTERNALS = ['mssql', 'tedious', '@prisma/adapter-mssql']
      const existingExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
        ? [config.externals]
        : []
      config.externals = [
        ...existingExternals,
        ({ request }, callback) => {
          if (request.startsWith('node:') || NODE_EXTERNALS.includes(request)) {
            return callback(null, `commonjs ${request}`)
          }
          callback()
        },
      ]
    }
    return config
  },
}

export default nextConfig
