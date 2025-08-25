import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Turbopack to avoid warnings when a webpack() function is present via withPayload
  turbopack: {
    // Use the default Next.js resolve extensions to keep behavior unchanged
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
};

export default withPayload(nextConfig);
