/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    assetPrefix: '/OneManAndAToolbox',
    basePath: '/OneManAndAToolbox'
}

module.exports = nextConfig
