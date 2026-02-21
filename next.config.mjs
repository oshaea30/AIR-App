/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent dev/prod manifest collisions when running build and dev in parallel workflows.
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev"
};

export default nextConfig;
