/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: "out",
    output: "export",
    experimental: {
        appDir: true,
    },
    images: {
        unoptimized: true,
    },
    basePath: "",
    assetPrefix: "./",
    trailingSlash: true,
}

module.exports = nextConfig