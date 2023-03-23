module.exports = {
  output: 'standalone',
  reactStrictMode: false,
  env: {
    ERTISAUTH_API_URL: process.env.ERTISAUTH_API_URL,
    ERTISAUTH_MEMBERSHIP_ID: process.env.ERTISAUTH_MEMBERSHIP_ID,
    MEDIA_API_URL: process.env.MEDIA_API_URL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
  },
  i18n: {
    locales: ['en', 'tr'],
    defaultLocale: 'en',
    localeDetection: false
  },
  compiler: {
    styledComponents: true 
  }
}

/*

// For running Bundle Analyzer;
// Package: "@next/bundle-analyzer": "^12.1.5",

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const NextConfig = {
  reactStrictMode: false,
  env: {
    ERTISAUTH_API_URL: process.env.ERTISAUTH_API_URL,
    ERTISAUTH_MEMBERSHIP_ID: process.env.ERTISAUTH_MEMBERSHIP_ID,
    MEDIA_API_URL: process.env.MEDIA_API_URL,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
  },
  i18n: {
    locales: ['en', 'tr'],
    defaultLocale: 'en'
  }
}

module.exports = withBundleAnalyzer({NextConfig})
*/