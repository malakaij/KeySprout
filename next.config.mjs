import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // Source maps are uploaded to Sentry at build time; the files are deleted
  // from the deployment bundle afterward so they never reach the browser.
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  // Disable automatic instrumentation for routes we instrument manually
  autoInstrumentServerFunctions: false,
})
