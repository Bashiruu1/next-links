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

  // Uncomment and set this if deploying to a GitHub Pages sub-path, e.g.
  // https://username.github.io/next-links
  // basePath: "/next-links",
};

export default nextConfig;
