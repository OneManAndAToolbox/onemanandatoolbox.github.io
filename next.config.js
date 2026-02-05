/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // Remove assetPrefix and basePath for GitHub Pages
    assetPrefix: '/OneManAndAToolbox',
    basePath: '/OneManAndAToolbox'
}

module.exports = nextConfig
