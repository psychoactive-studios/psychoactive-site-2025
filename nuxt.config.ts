// https://nuxt.com/docs/api/configuration/nuxt-config

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://psychoactive.co.nz'
const DEFAULT_TITLE = 'Psychoactive Studios — AI-era Design & Development Agency'
const DEFAULT_DESCRIPTION = "Based in Wellington, NZ, operating globally. We're a design and development agency building AI-era websites for ambitious brands. 50+ international awards."
const OG_IMAGE_URL = `${SITE_URL}/og.png`

// Organization JSON-LD schema. Surfaced in app.head.script so it's
// in the static HTML for crawlers / Google's knowledge panel.
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Psychoactive Studios',
  alternateName: 'Psychoactive',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: DEFAULT_DESCRIPTION,
  foundingDate: '2018',
  email: 'hello@psychoactive.co.nz',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Wellington',
    addressCountry: 'NZ',
  },
  sameAs: [
    'https://www.linkedin.com/company/psychoactive-studios',
    'https://www.instagram.com/psychoactivestudios',
    'https://www.behance.net/psychoactive',
    'https://dribbble.com/psychoactive',
  ],
}

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
      failOnError: false,
      // Manually specify routes that must be generated
      // routes: ['/'],
      // If an error occurs on a page, the build won't fail
      // failOnError: false,
    }
  },
  runtimeConfig: {
    // Server-only secrets — never exposed to the client bundle.
    // Used by the Design Audit API routes (server/api/audit.*).
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    supabaseCrmUrl: process.env.SUPABASE_CRM_URL || '',
    supabaseCrmServiceKey: process.env.SUPABASE_CRM_SERVICE_KEY || '',
    // Resend — sends the audit report to leads after they unlock it.
    // If RESEND_API_KEY is blank the email step skips silently (useful
    // before the Resend account is wired up).
    resendApiKey: process.env.RESEND_API_KEY || '',
    auditFromEmail: process.env.AUDIT_FROM_EMAIL || 'audit@psychoactive.co.nz',

    public: {
      siteUrl: SITE_URL,
      strapiBaseUrl: process.env.NUXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337',
      strapiApiKey: process.env.STRAPI_API_KEY || '',
      strapiPreviewUrl: process.env.STRAPI_PREVIEW_URL || '',
      strapiPreviewSecret: process.env.STRAPI_PREVIEW_SECRET || '',
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
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    'nuxt-svgo',
    '@nuxtjs/sitemap',
    // Renders dynamic 1200x630 social share images for pages that
    // call defineOgImageComponent(). Used by /design-audit so links
    // shared on X/LinkedIn generate per-audit preview cards.
    'nuxt-og-image',
  ],

  // nuxt-og-image config. The site URL is used to build absolute
  // paths to the generated images.
  ogImage: {
    defaults: {
      component: 'DesignAuditOg',
      width: 1200,
      height: 630,
    },
    fonts: ['Inter:400', 'Inter:600', 'Inter:700'],
  },

  // Sitemap — populates /sitemap.xml from an explicit static-page
  // list plus a Strapi-backed dynamic source (/api/__sitemap__/urls).
  // Excludes preview routes so Strapi drafts don't end up in the
  // public sitemap.
  //
  // Static URLs are listed explicitly rather than relying on
  // nitro.prerender.crawlLinks — crawling only runs on fully static
  // builds and the Vercel deployment is hybrid/SSR.
  sitemap: {
    siteUrl: 'https://www.psychoactive.co.nz',
    exclude: ['/preview/**'],
    urls: [
      { loc: '/', priority: 1.0, changefreq: 'weekly' },
      { loc: '/about', priority: 0.8, changefreq: 'monthly' },
      { loc: '/services', priority: 0.8, changefreq: 'monthly' },
      { loc: '/work', priority: 0.8, changefreq: 'weekly' },
      { loc: '/content-hub', priority: 0.7, changefreq: 'weekly' },
      { loc: '/contact', priority: 0.5, changefreq: 'yearly' },
      { loc: '/webflow-enterprise-agency', priority: 0.7, changefreq: 'monthly' },
      // Uncomment when /design-audit ships to production.
      // { loc: '/design-audit', priority: 0.7, changefreq: 'monthly' },
    ],
    sources: ['/api/__sitemap__/urls'],
    defaults: {
      changefreq: 'weekly',
      priority: 0.7,
    },
  },
  css: ['modern-normalize/modern-normalize.css', '~/assets/styles/main.scss'],
  image: {
    // Specify the provider that supports static generation
    provider: 'ipx',
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en-NZ',
      },
      title: DEFAULT_TITLE,
      meta: [
        { name: 'description', content: DEFAULT_DESCRIPTION },
        { name: 'viewport', content: 'width=device-width,minimum-scale=1.0,maximum-scale=1.0' },

        // Open Graph
        { key: 'og:title', property: 'og:title', content: DEFAULT_TITLE },
        { key: 'og:description', property: 'og:description', content: DEFAULT_DESCRIPTION },
        { key: 'og:type', property: 'og:type', content: 'website' },
        { key: 'og:url', property: 'og:url', content: SITE_URL },
        { key: 'og:site_name', property: 'og:site_name', content: 'Psychoactive Studios' },
        { key: 'og:locale', property: 'og:locale', content: 'en_NZ' },
        { key: 'og:image', property: 'og:image', content: OG_IMAGE_URL },
        { key: 'og:image:secure_url', property: 'og:image:secure_url', content: OG_IMAGE_URL },
        { key: 'og:image:width', property: 'og:image:width', content: '1200' },
        { key: 'og:image:height', property: 'og:image:height', content: '631' },

        // Twitter
        { key: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { key: 'twitter:title', name: 'twitter:title', content: DEFAULT_TITLE },
        { key: 'twitter:description', name: 'twitter:description', content: DEFAULT_DESCRIPTION },
        { key: 'twitter:image', name: 'twitter:image', content: OG_IMAGE_URL },
      ],
      link: [
        // Default canonical — pages can override via useHead({ link: [{ rel: 'canonical', ... }] }).
        { key: 'canonical', rel: 'canonical', href: SITE_URL },
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
      ],
      script: [
        // Organization JSON-LD — helps Google's knowledge panel + trust signals.
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(ORGANIZATION_SCHEMA),
        },
      ],
    }
  },
  // Redirects for content-hub pages
  routeRules: {
    // Force SSR-on-demand (no prerender) for case-study pages. The
    // prerender step crawls links at build time and tries to fetch
    // each /work/:slug from Strapi — if Strapi is briefly unreachable
    // or returns an error during the build, the prerendered HTML is
    // the 404 page, and Vercel then serves that cached 404 forever
    // on direct URL hits. (Client-side navigation from the homepage
    // bypasses the cache and re-fetches, which is why the page works
    // when you navigate to it but 404s on direct URL.) Setting
    // prerender: false makes each request hit the serverless
    // function, which fetches Strapi fresh.
    '/work/**': { prerender: false },
    // Same defensive treatment for content-hub article pages — they
    // share the same Strapi-backed pattern.
    '/content-hub/**': { prerender: false },

    // Content Hub Redirects
    // '/content-hub/how-we-built-award-worthy-websites-for-global-events': { redirect: { to: '/content-hub/how-we-built-award-worthy-websites-for-global-events', statusCode: 301 } },
    '/content-hub/ai-vs-custom-development-when-to-use-what': { redirect: { to: '/content-hub/when-to-build-with-ai-and-when-to-use-webflow-and-custom-code', statusCode: 301 } },
    '/content-hub/zendetta-more-relevant-than-ever-as-syria-enters-a-new-chapter': { redirect: { to: '/content-hub/zendetta-bearing-witness-as-syria-enters-a-new-chapter', statusCode: 301 } },
    '/content-hub/accessible-websites-the-bedrock-of-success-for-health-organizations': { redirect: { to: '/content-hub/why-accessible-healthcare-websites-are-critical-for-patient-trust-and-growth', statusCode: 301 } },
    // '/content-hub/capturing-the-spirit-of-summer-games-fest': { redirect: { to: '/content-hub/capturing-the-spirit-of-summer-games-fest', statusCode: 301 } },
    '/content-hub/webflow-new-zealand-2024-the-latest-trends-and-partner-insights': { redirect: { to: '/content-hub/the-state-of-webflow-in-new-zealand-2024-industry-report', statusCode: 301 } },
    '/content-hub/leading-the-game-psychoactives-pioneering-role-in-building-gaming-websites': { redirect: { to: '/content-hub/psychoactive-builds-world-class-gaming-websites', statusCode: 301 } },
    '/content-hub/common-reasons-to-move-to-webflow': { redirect: { to: '/content-hub/why-businesses-are-migrating-to-webflow-performance-flexibility-and-scale', statusCode: 301 } },
    '/content-hub/what-does-webflow-offer': { redirect: { to: '/content-hub/webflow-features-explained-what-it-offers-businesses-in-2026', statusCode: 301 } },
    '/content-hub/what-is-webflow': { redirect: { to: '/content-hub/what-is-webflow-a-complete-guide-for-business-owners', statusCode: 301 } },
    '/content-hub/integrating-unity-into-psychoactive-tm-s-web-development-pipeline': { redirect: { to: '/content-hub/from-unity-to-web-gl-building-high-performance-3d-experiences-for-the-modern-web', statusCode: 301 } },
    '/content-hub/how-we-use-ai-to-augment-our-web-design-process': { redirect: { to: '/content-hub/how-we-use-ai-in-web-design-to-increase-speed-quality-and-innovation', statusCode: 301 } },
    '/content-hub/writing-great-website-content-that-matches-website-wireframes': { redirect: { to: '/content-hub/how-to-write-high-converting-website-content', statusCode: 301 } },
    // '/content-hub/psychoactive-nominated-by-awwwards-for-agency-of-the-year-2022': { redirect: { to: '/content-hub/psychoactive-nominated-by-awwwards-for-agency-of-the-year-2022', statusCode: 301 } },
    '/content-hub/psychoactive-becomes-new-zealands-first-webflow-enterprise-partner': { redirect: { to: '/content-hub/psychoactive-named-new-zealands-first-webflow-enterprise-partner', statusCode: 301 } },
    '/content-hub/psychoactive-amphibians': { redirect: { to: 'https://psychoactiveamphibians.xyz/', statusCode: 302 } },
    '/content-hub/the-making-of-zendetta': { redirect: { to: '/content-hub/how-zendetta-was-made-psychoactives-most-awarded-project', statusCode: 301 } },
    '/content-hub/how-psychoactive-set-up-crypto-payroll-for-their-employees': { redirect: { to: '/content-hub/psychoactive-leads-early-adoption-of-crypto-payroll-in-new-zealand', statusCode: 301 } },
    '/content-hub/the-state-of-webflow-in-new-zealand-2021': { redirect: { to: '/content-hub/the-state-of-webflow-in-new-zealand-2021-industry-report', statusCode: 301 } },
    '/content-hub/psychoactive-becomes-a-professional-webflow-partner': { redirect: { to: '/content-hub/psychoactive-officially-recognised-as-a-webflow-professional-partner', statusCode: 301 } },

    // Work (Case Studies) Redirects
    '/work/blackbird-vc': { redirect: { to: '/work/blackbird', statusCode: 301 } },
    '/work/good-shepherd': { redirect: { to: '/work/good-shepherd-entertainment', statusCode: 301 } },
    '/work/aratek-biometric': { redirect: { to: '/work/aratek', statusCode: 301 } },

    // Static Pages Redirects
    '/webflow-enterprise-partners': { redirect: { to: '/webflow-enterprise-agency', statusCode: 301 } },
  },
})