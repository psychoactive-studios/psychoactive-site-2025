// Dynamic sitemap source — fetches case-study and content-hub slugs
// from Strapi and returns them for @nuxtjs/sitemap to include in the
// generated /sitemap.xml.
//
// Wired up via `sitemap.sources: ['/api/__sitemap__/urls']` in
// nuxt.config.ts. The sitemap module calls this endpoint at build
// time (and on subsequent runtime invalidations in SSR mode).
//
// Existing runtime config keys are reused:
//   - public.strapiBaseUrl  (NUXT_PUBLIC_STRAPI_BASE_URL)
//   - public.strapiApiKey   (STRAPI_API_KEY)
//
// The response shape mirrors what existing pages
// (app/pages/work/index.vue and app/pages/content-hub/index.vue)
// already consume: { data: [{ slug, updatedAt, ... }] }.
//
// If Strapi is unreachable we log and return an empty array rather
// than failing the build — the sitemap still generates with the
// static URLs listed in nuxt.config.ts.

import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrl } from '#sitemap/types'

type StrapiItem = {
  slug: string
  updatedAt?: string
  publishedAt?: string
}

type StrapiResponse = {
  data: StrapiItem[]
}

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const base = config.public.strapiBaseUrl
  const key = config.public.strapiApiKey

  if (!base || base.startsWith('http://localhost')) {
    console.warn('[sitemap] Strapi base URL missing or localhost — skipping dynamic URLs')
    return []
  }

  const headers = key ? { Authorization: `Bearer ${key}` } : {}
  const urls: SitemapUrl[] = []

  // Case studies — /work/:slug
  try {
    const works = await $fetch<StrapiResponse>('/api/works', {
      baseURL: base,
      headers,
      query: {
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'pagination[pageSize]': 200,
      },
    })
    for (const w of works?.data ?? []) {
      if (!w?.slug) continue
      urls.push({
        loc: `/work/${w.slug}`,
        lastmod: w.updatedAt ?? w.publishedAt,
      })
    }
  }
  catch (err) {
    console.error('[sitemap] Failed to fetch /api/works from Strapi:', err)
  }

  // Content hub articles — /content-hub/:slug
  try {
    const articles = await $fetch<StrapiResponse>('/api/articles', {
      baseURL: base,
      headers,
      query: {
        'fields[0]': 'slug',
        'fields[1]': 'updatedAt',
        'pagination[pageSize]': 200,
      },
    })
    for (const a of articles?.data ?? []) {
      if (!a?.slug) continue
      urls.push({
        loc: `/content-hub/${a.slug}`,
        lastmod: a.updatedAt ?? a.publishedAt,
      })
    }
  }
  catch (err) {
    console.error('[sitemap] Failed to fetch /api/articles from Strapi:', err)
  }

  return urls
})
