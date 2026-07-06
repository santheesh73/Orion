import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: false,
  disable: process.env.NODE_ENV === "development",
  maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
  fallbacks: {
    document: "/offline"
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "orion-fonts",
        expiration: {
          maxEntries: 24,
          maxAgeSeconds: 60 * 60 * 24 * 365
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "orion-images",
        expiration: {
          maxEntries: 128,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    },
    {
      urlPattern: /\.(?:js|css|woff2?|json)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "orion-static",
        expiration: {
          maxEntries: 256,
          maxAgeSeconds: 60 * 60 * 24 * 14
        }
      }
    },
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname.startsWith("/models"),
      handler: "NetworkFirst",
      options: {
        cacheName: "orion-model-metadata",
        networkTimeoutSeconds: 4,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 7
        }
      }
    },
    {
      urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "orion-app-shell",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 60 * 60 * 24 * 7
        }
      }
    }
  ]
});

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      [
        "connect-src 'self' blob:",
        "https://huggingface.co",
        "https://*.huggingface.co",
        "https://cdn-lfs.huggingface.co",
        "https://*.hf.co",
        "https://*.xethub.hf.co",
        "https://raw.githubusercontent.com"
      ].join(" "),
      "worker-src 'self' blob:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'"
    ].join("; ")
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()"
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true
    };
    return config;
  }
};

export default process.env.ORION_ENABLE_NEXT_PWA === "1" ? withPWA(nextConfig) : nextConfig;
