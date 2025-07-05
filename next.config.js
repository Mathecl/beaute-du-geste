// https://www.npmjs.com/package/next-compose-plugins
const withPlugins = require('next-compose-plugins');

const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache.js');
const isProduction = process.env.NODE_ENV === 'production';

// const { withSentryConfig } = require('@sentry/nextjs');

// https://nextjs.org/docs/advanced-features/security-headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Security header used to block the use of following values: camera, geolocation, browsing topics, microphone, ...
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), browsing-topics=()', // microphone=(),
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'tailwindui.com',
    ],
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // project has type errors.
    ignoreBuildErrors: true,
  },
  compress: true, // for pwa performance
  transpilePackages: ['ui'],
};

const sentryWebpackPluginConfig = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: 'beaute-du-geste',
  project: 'beaute-du-geste',
  // authToken: process.env.SENTRY_AUTH_TOKEN,
};

const sentryConfig = {
  sentry: {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,
    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
};

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: !isProduction,
  runtimeCaching,
  // swcMinify: true, // causes build error
})(nextConfig);

module.exports = withPlugins(
  [
    // plugin with configuration options
    [
      withPWA,
      {
        dest: 'public',
        register: true,
        skipWaiting: true,
        disable: !isProduction,
        runtimeCaching,
        // swcMinify: true, // causes build error
      },
    ],

    // example of plugin without configuration options
    // images,

    // plugin with configuration options in withSentryConfig parameters
    // [
    //   withSentryConfig(sentryConfig, sentryWebpackPluginConfig),
    //   {
    //     // Empty
    //   },
    // ],
  ],
  nextConfig,
);
