// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  // routeRules: {
  //   '/content-hub': { isr: 60 },
  //   '/content-hub/**': { isr: 60 },
  // },

  runtimeConfig: {
    public: {
      strapiBaseUrl: process.env.NUXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337',
      strapiApiKey: process.env.STRAPI_API_KEY || '',
    }
  },

  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'mux-player',
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/scripts', 'nuxt-svgo', 'nuxt-swiper'],
  css: ['modern-normalize/modern-normalize.css', '~/assets/styles/main.scss'],
  app: {
    head: {
      title: 'Psychoactive Studios | Web Design Agency | Webflow Partner',
      meta: [
        { name: 'description', content: 'Award-Winning Multidisciplinary Digital Experience Agency | We design and develop websites, web apps & motion graphics for brands who want to push boundaries' },
      ],
      link: [
        {
          rel: 'shortcut icon',
          href: '/favicon.gif',
          type: 'image/x-icon'
        },
        {
          rel: 'apple-touch-icon',
          href: '/favicon-256x256.gif'
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/fonts/RoobertTRIAL-Regular.otf',
          type: 'font/otf',
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          as: 'font',
          href: '/fonts/RoobertMonoTRIAL-Medium.otf',
          type: 'font/otf',
          crossorigin: 'anonymous'
        }
      ]
    }
  }
})