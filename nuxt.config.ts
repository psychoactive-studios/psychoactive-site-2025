// https://nuxt.com/docs/api/configuration/nuxt-config

/**
 * Nuxt configuration for the Psychoactive Studios website.
 * 
 * This configuration defines the application's behavior, including:
 * - **Compatibility**: Set to '2025-07-15' for feature stability.
 * - **SSR**: Enabled for Server-Side Rendering.
 * - **Nitro**: Configured for static site generation (SSG) with link crawling enabled and error tolerance during builds.
 * - **Runtime Config**: Exposes public environment variables for Strapi API integration.
 * - **DevTools**: Enabled with timeline features for debugging.
 * - **Vue**: Configured to recognize `mux-player` as a custom element.
 * - **Modules**: Includes ESLint, Nuxt Image, Nuxt Scripts, and SVGO for enhanced development and performance.
 * - **CSS**: Loads global normalization and custom SCSS styles.
 * - **App Head**: Defines SEO metadata (title, description), favicons, and preloads custom fonts (Roobert TRIAL) for optimized LCP.
 * 
 * @see {@link https://nuxt.com/docs/api/configuration/nuxt-config}
 */
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  nitro: {
    prerender: {
      // Automatically crawls all <a> links on pages and generates them
      crawlLinks: true,
      // Manually specify routes that must be generated
      // routes: ['/'],
      // If an error occurs on a page, the build won't fail
      // failOnError: false,
    }
  },
  // routeRules: {
  //   '/content-hub': { isr: 60 },
  //   '/content-hub/**': { isr: 60 },
  // },

  runtimeConfig: {
    strapiPreviewSecret: process.env.STRAPI_PREVIEW_SECRET || '',
    public: {
      strapiBaseUrl: process.env.NUXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337',
      strapiApiKey: process.env.STRAPI_API_KEY || '',
      strapiPreviewUrl: process.env.STRAPI_PREVIEW_URL || '',
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
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/scripts', 'nuxt-svgo',],
  css: ['modern-normalize/modern-normalize.css', '~/assets/styles/main.scss'],
  image: {
    // Specify the provider that supports static generation
    provider: 'ipx',
  },
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