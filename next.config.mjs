/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: "pbs.twimg.com" },
            { hostname: "assets.aceternity.com" },
        ],
    },
    experimental: {
        optimizePackageImports: ["@react-three/drei"],
    },
    // model files carry a version in their name (so101.v1.glb), so they can be cached forever
    async headers() {
        return [
            {
                source: "/models/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
        ];
    },
};

export default nextConfig;
