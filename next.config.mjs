/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { hostname: "pbs.twimg.com" },
            { hostname: "assets.aceternity.com" },
        ],
    },
};

export default nextConfig;
