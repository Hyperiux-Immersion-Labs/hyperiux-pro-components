import { withSentryConfig } from "@sentry/nextjs";
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hasSentryBuildConfig = Boolean(
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT &&
    process.env.SENTRY_AUTH_TOKEN
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/effects',
        permanent: false,
      },
      {
        source: '/effects/components/book-flip',
        destination: '/effects/webgl/book-flip',
        permanent: false,
      },
      {
        source: '/effects/components/book-flip/preview',
        destination: '/effects/webgl/book-flip/preview',
        permanent: false,
      },
      {
        source: '/effects/components/colliding-models',
        destination: '/effects/webgl/colliding-models',
        permanent: false,
      },
      {
        source: '/effects/components/colliding-models/preview',
        destination: '/effects/webgl/colliding-models/preview',
        permanent: false,
      },
      {
        source: '/effects/components/file-encryption',
        destination: '/effects/webgl/file-encryption',
        permanent: false,
      },
      {
        source: '/effects/components/file-encryption/preview',
        destination: '/effects/webgl/file-encryption/preview',
        permanent: false,
      },
      {
        source: '/effects/components/hyperiux-glitter-concept',
        destination: '/effects/webgl/hyperiux-glitter-concept',
        permanent: false,
      },
      {
        source: '/effects/components/hyperiux-glitter-concept/preview',
        destination: '/effects/webgl/hyperiux-glitter-concept/preview',
        permanent: false,
      },
      {
        source: '/effects/components/infinite-grid-gallery',
        destination: '/effects/webgl/infinite-grid-gallery',
        permanent: false,
      },
      {
        source: '/effects/components/infinite-grid-gallery/preview',
        destination: '/effects/webgl/infinite-grid-gallery/preview',
        permanent: false,
      },
      {
        source: '/effects/components/interactive-hover-slider',
        destination: '/effects/webgl/interactive-hover-slider',
        permanent: false,
      },
      {
        source: '/effects/components/interactive-hover-slider/preview',
        destination: '/effects/webgl/interactive-hover-slider/preview',
        permanent: false,
      },
      {
        source: '/effects/components/gooey-counter',
        destination: '/effects/others/gooey-counter',
        permanent: false,
      },
      {
        source: '/effects/components/gooey-counter/preview',
        destination: '/effects/others/gooey-counter/preview',
        permanent: false,
      },
      {
        source: '/effects/components/interactive-list-preview',
        destination: '/effects/others/interactive-list-preview',
        permanent: false,
      },
      {
        source: '/effects/components/interactive-list-preview/preview',
        destination: '/effects/others/interactive-list-preview/preview',
        permanent: false,
      },
      {
        source: '/effects/components/portfolio-concept',
        destination: '/effects/others/portfolio-concept',
        permanent: false,
      },
      {
        source: '/effects/components/portfolio-concept/preview',
        destination: '/effects/others/portfolio-concept/preview',
        permanent: false,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

const sentryConfig = hasSentryBuildConfig
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,

      // Only upload source maps in CI/production to avoid slowing local builds
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

export default process.env.NODE_ENV === "development" ? nextConfig : sentryConfig;
