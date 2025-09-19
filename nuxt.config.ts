// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/scripts', 'nuxt-svgo', 'nuxt-lottie'],
  css: ['modern-normalize/modern-normalize.css', '~/assets/styles/main.scss'],
  app: {
    head: {
      link: [
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