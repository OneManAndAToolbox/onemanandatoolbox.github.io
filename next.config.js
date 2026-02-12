/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    // REMOVE basePath and assetPrefix for a .github.io repo
}

module.exports = nextConfig
