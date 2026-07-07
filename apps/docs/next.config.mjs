import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Monorepo root, shared by outputFileTracingRoot and turbopack.root (Next requires them to match).
const monorepoRoot = path.join(__dirname, "../../");

const shouldUploadSentrySourceMaps = Boolean(
  process.env.CI === "true" || process.env.SENTRY_UPLOAD_SOURCE_MAPS === "true"
);

const hasSentryBuildConfig = Boolean(
  shouldUploadSentrySourceMaps &&
    process.env.NEXT_PUBLIC_SENTRY_DSN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN
);

const allowedIframeSources = [
  "'self'",
  "https://*.csb.app",
  "https://codesandbox.io",
  "https://codepen.io",
  "https://*.codepen.io",
  "https://*.codepen.dev",
  "https://challenges.cloudflare.com",
].join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["local.vault.hyperiux.com"],

  outputFileTracingRoot: monorepoRoot,

  turbopack: {
    root: monorepoRoot,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "framer-motion", "gsap"],
    optimizeCss: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-src ${allowedIframeSources};`,
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

const sentryConfig = hasSentryBuildConfig
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      silent: true,
      widenClientFileUpload: true,
      hideSourceMaps: true,

      webpack: {
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;

export default process.env.NODE_ENV === "development"
  ? nextConfig
  : sentryConfig;