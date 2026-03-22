import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents : true,
 images: {
   remotePatterns: [
{
        protocol: "https",
        hostname: "res.cloudinary.com"
}
   ]
 },
  // Keep mongoose as a Node.js external package on the server.
  // This avoids Turbopack dev resolving it to a hashed virtual module name.
  serverExternalPackages: ["mongoose"],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
