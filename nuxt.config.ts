// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-14',
  devtools: { enabled: true },

  // SSR 是 SEO 的核心：搜索引擎能直接抓取完整 HTML
  ssr: true,

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  // 站点基础信息，供 SEO 模块与 useSeoMeta 使用
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: process.env.NUXT_PUBLIC_SITE_NAME || 'My Blog',
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || 'blog',
    dbPassword: process.env.DB_PASSWORD || 'blog123',
    dbName: process.env.DB_NAME || 'blog_db',
    redisUrl: process.env.REDIS_URL || '',
    storageDriver: process.env.STORAGE_DRIVER || 'local',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'My Blog',
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || '一个支持 SEO 的个人技术博客',
      gaId: process.env.NUXT_PUBLIC_GA_ID || '',
      baiduTongjiId: process.env.NUXT_PUBLIC_BAIDU_TONGJI_ID || '',
    },
  },

  // 动态文章页自动加入 sitemap
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: '/rss.xml' },
      ],
    },
  },

  nitro: {
    preset: 'node-server',
    publicAssets: [
      {
        baseURL: '/vditor',
        dir: 'node_modules/vditor/dist',
        maxAge: 60 * 60 * 24 * 365,
      },
    ],
  },

  vite: {
    optimizeDeps: {
      include: ['vditor'],
    },
  },

  // ISR：高流量页面增量静态渲染（SWR 模式）
  routeRules: {
    '/': { isr: 600, swr: true },
    '/posts/**': { isr: 3600, swr: true },
    '/categories/**': { isr: 3600, swr: true },
    '/tags/**': { isr: 3600, swr: true },
    '/authors/**': { isr: 1800, swr: true },
    '/api/**': { cors: true },
  },
})
