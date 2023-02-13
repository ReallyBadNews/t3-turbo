// @ts-check
import { withPlaiceholder } from "@plaiceholder/next";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds and Linting.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@badnews/api",
    "@badnews/auth",
    "@badnews/db",
    "@badnews/utils",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: !!process.env.CI },
  typescript: { ignoreBuildErrors: !!process.env.CI },
};

export default withPlaiceholder(config);
