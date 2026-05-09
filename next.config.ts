import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — deploy to GitHub Pages or Vercel as a plain static site.
  // Run `npm run build` and the output lands in the `out/` folder.
  output: "export",

  // Required for static export: disables server-side image optimisation so
  // next/image works when there's no Node.js server.
  images: {
    unoptimized: true,
  },

  // Set automatically in CI; omitted locally so `npx serve out` works without path prefix.
  basePath: process.env.GITHUB_ACTIONS ? "/next-links" : "",
};

export default nextConfig;
