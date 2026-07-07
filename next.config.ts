import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only packages that must not be bundled by the dev/build bundler.
  serverExternalPackages: ["@prisma/client", "@react-pdf/renderer", "exceljs", "bcryptjs"],
};

export default nextConfig;
