import { withSentryConfig } from "@sentry/nextjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
].join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["local.vault.hyperiux.com"],

  turbopack: {
    root: __dirname,
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

  async redirects() {
    return [
      {
        source: "/effects/components/book-flip",
        destination: "/effects/webgl-effects/book-flip",
        permanent: false,
      },
      {
        source: "/effects/components/book-flip/preview",
        destination: "/effects/webgl-effects/book-flip/preview",
        permanent: false,
      },
      {
        source: "/effects/components/colliding-models",
        destination: "/effects/webgl-effects/colliding-models",
        permanent: false,
      },
      {
        source: "/effects/components/colliding-models/preview",
        destination: "/effects/webgl-effects/colliding-models/preview",
        permanent: false,
      },
      {
        source: "/effects/components/file-encryption",
        destination: "/effects/webgl-effects/file-encryption",
        permanent: false,
      },
      {
        source: "/effects/components/file-encryption/preview",
        destination: "/effects/webgl-effects/file-encryption/preview",
        permanent: false,
      },
      {
        source: "/effects/components/hyperiux-glitter-concept",
        destination: "/effects/webgl-effects/hyperiux-glitter-concept",
        permanent: false,
      },
      {
        source: "/effects/components/hyperiux-glitter-concept/preview",
        destination: "/effects/webgl-effects/hyperiux-glitter-concept/preview",
        permanent: false,
      },
      {
        source: "/effects/components/infinite-grid-gallery",
        destination: "/effects/webgl-effects/infinite-grid-gallery",
        permanent: false,
      },
      {
        source: "/effects/components/infinite-grid-gallery/preview",
        destination: "/effects/webgl-effects/infinite-grid-gallery/preview",
        permanent: false,
      },
      {
        source: "/effects/components/hover-slider",
        destination: "/effects/webgl-effects/hover-slider",
        permanent: false,
      },
      {
        source: "/effects/components/hover-slider/preview",
        destination: "/effects/webgl-effects/hover-slider/preview",
        permanent: false,
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