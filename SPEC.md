# Psychoactive Studios — Dev Spec

> **URL:** [psychoactive.co.nz](https://psychoactive.co.nz)  
> **Type:** Marketing site for a digital agency with CMS-driven content  
> **Status:** Production  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Environment Variables](#4-environment-variables)
5. [Routing & Pages](#5-routing--pages)
6. [Components](#6-components)
7. [Composables](#7-composables)
8. [Utilities & Animations](#8-utilities--animations)
9. [Data Layer](#9-data-layer)
10. [API Integrations](#10-api-integrations)
11. [Assets & Fonts](#11-assets--fonts)
12. [SEO & Meta](#12-seo--meta)
13. [Known Issues & Tech Debt](#13-known-issues--tech-debt)
14. [Dev Commands](#14-dev-commands)

---

## 1. Project Overview

**Psychoactive Studios** is an award-winning multidisciplinary digital experience agency (NZ). The site is a premium promotional experience focused on animation, 3D/WebGL, video, and interactivity.

**Main sections:**
- Portfolio / Case Studies (Work)
- Agency info (About)
- Services
- Webflow Enterprise Agency landing
- Content Hub (blog)
- Contact (multi-step form)

---

## 2. Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Nuxt | ^4.1.1 |
| UI | Vue | ^3.5.21 |
| Routing | Vue Router | ^4.5.1 |
| Rendering | SSR + Nitro prerender (SSG hybrid) | — |
| Styles | SCSS (sass-embedded) | ^1.92.1 |
| CSS Reset | modern-normalize | ^3.0.1 |
| Animations | GSAP (+ ScrollTrigger, SplitText) | ^3.13.0 |
| Smooth Scroll | Lenis | ^1.3.16 |
| 3D / WebGL | Three.js | ^0.180.0 |
| Video | @mux/videojs-kit (Mux + Video.js) | ^0.12.3 |
| Lottie | lottie-web | ^5.13.0 |
| Noise | simplex-noise | ^4.0.3 |
| Audio | Howler | ^2.2.4 |
| Carousel | @splidejs/vue-splide + auto-scroll | ^0.6.12 |
| Marquee | vue3-marquee | ^4.2.2 |
| Forms validation | vee-validate | ^4.15.1 |
| Utilities | @vueuse/core | ^13.9.0 |
| Query builder | qs | ^6.14.0 |
| Head management | @unhead/vue | ^2.0.14 |
| Image optimization | @nuxt/image (provider: ipx) | ^1.11.0 |
| SVG handling | nuxt-svgo | ^4.2.6 |
| Scripts loader | @nuxt/scripts | ^0.11.13 |
| Linting | ESLint 9 + @nuxt/eslint | ^9.35.0 |

**Fonts:** Roobert TRIAL (Regular + Mono Medium) — custom OTF files, preloaded in `<head>`.

---

## 3. Architecture

```
/
├── app/
│   ├── pages/              # File-based routing (Nuxt)
│   ├── components/         # Vue components (96 files)
│   │   ├── about/
│   │   ├── contact/
│   │   ├── homepage/
│   │   ├── layout/
│   │   ├── services/
│   │   ├── webflow/
│   │   ├── work/
│   │   └── ui/
│   ├── composables/        # 10 composable files
│   ├── data/               # Static JS data
│   ├── utils/
│   │   ├── animations/     # GSAP animations per page
│   │   └── glsl/           # Vertex + fragment shaders
│   ├── plugins/            # gsap.client.js, Vue3Marquee.client.js
│   ├── assets/
│   │   └── styles/         # main.scss + partials
│   └── router.options.ts   # Custom scrollBehavior
├── server/
│   └── api/
│       └── preview.get.ts  # Nitro endpoint for Strapi Preview
├── public/
│   ├── fonts/
│   ├── video/
│   └── ...
├── nuxt.config.ts
└── package.json
```

### Rendering Strategy

- **SSR enabled** (`ssr: true`)
- **Nitro prerender** with `crawlLinks: true` — automatically generates static HTML for discovered links
- `failOnError: false` — the build does not fail when individual pages fail to render
- Scroll is controlled manually (GSAP/Lenis): `scrollBehavior` returns `false`

---

## 4. Environment Variables

| Variable | Where it is used | Default |
|----------|------------------|---------|
| `NUXT_PUBLIC_SITE_URL` | SEO meta, OG URLs | `https://psychoactive.co.nz` |
| `NUXT_PUBLIC_STRAPI_BASE_URL` | All Strapi fetches | `http://localhost:1337` |
| `STRAPI_API_KEY` | Bearer token for Strapi API | `''` |
| `STRAPI_PREVIEW_URL` | Strapi Preview redirect | `''` |
| `STRAPI_PREVIEW_SECRET` | Preview request validation | `''` |

> **Note:** `STRAPI_API_KEY` is exposed via `runtimeConfig.public` → available in the client bundle. Prefer moving Strapi calls behind a server proxy or Nitro server routes for protected requests.

---

## 5. Routing & Pages

### Primary routes

| Route | File | Data source |
|-------|------|-------------|
| `/` | `pages/index.vue` | Strapi `GET /api/homepage` |
| `/about` | `pages/about.vue` | — |
| `/services` | `pages/services.vue` | — |
| `/work` | `pages/work/index.vue` | Strapi `GET /api/works` |
| `/work/:slug` | `pages/work/[slug].vue` | Strapi `GET /api/works/:slug` |
| `/content-hub` | `pages/content-hub/index.vue` | Strapi `GET /api/articles` |
| `/content-hub/:slug` | `pages/content-hub/[slug].vue` | Strapi `GET /api/articles/:slug` |
| `/contact` | `pages/contact.vue` | — |
| `/webflow-enterprise-agency` | `pages/webflow-enterprise-agency.vue` | Strapi (single type) |
| `/preview/content-hub/:slug` | `pages/preview/content-hub/[slug].vue` | Strapi draft (preview) |
| `/preview/work/:slug` | `pages/preview/work/[slug].vue` | Strapi draft (preview) |

### Utility routes

| Route | File | Notes |
|-------|------|-------|
| `[...slug]` | `pages/[...slug].vue` | Catch-all → redirect to `/not-found` |

### Redirects (301/302)

Defined in `nuxt.config.ts → routeRules`:

- ~14 Content Hub redirects (old slugs → new)
- 3 Work redirects (`blackbird-vc` → `blackbird`, etc.)
- `/webflow-enterprise-partners` → `/webflow-enterprise-agency`
- `/content-hub/psychoactive-amphibians` → external site (302)

### Nitro Server API

| Endpoint | File | Behavior |
|----------|------|----------|
| `GET /api/preview` | `server/api/preview.get.ts` | Validates `secret`, redirect 307 → `/preview/${slug}?status=...` |

---

## 6. Components

### `layout/`

| Component | Purpose |
|-----------|---------|
| `Header.vue` | Header with logo and navigation controls |
| `Footer.vue` | Footer |
| `Navigation.vue` | Desktop navigation |
| `NavigationMobile.vue` | Mobile navigation (508 lines) |
| `Brief.vue` | Brief / overlay panel |
| `ScrollProvider.vue` | Lenis smooth scroll provider |
| `FixedTarget.vue` | Portal target for fixed-position elements |

### `homepage/`

| Component | Purpose |
|-----------|---------|
| `Hero.vue` | Homepage hero (desktop) |
| `HeroMobile.vue` | Homepage hero (mobile) |
| `HomeAwards.vue` | Awards section |
| `HomeNewsList.vue` | News / articles list |
| `HomeNewsCard.vue` | News card |
| `HomeOnScrollFilledText.vue` | Text that fills on scroll |

### `about/`

| Component | Purpose |
|-----------|---------|
| `Hero.vue` | About hero |
| `HeroCenterLine.vue` | Decorative center line |
| `Ethos.vue` | Values section |
| `Metamorphosis.vue` | Animated transformation section |
| `OurStory.vue` | “Our Story” section |
| `Team.vue` | Team section |
| `TextWithTitle.vue` | Text block with title |

### `services/`

| Component | Purpose |
|-----------|---------|
| `Hero.vue` | Services hero |
| `HeroCenterLine.vue` | Decorative line |
| `ServicesList.vue` | Services list |
| `Stepper.vue` | Process stepper |
| `StepperPagination.vue` | Stepper pagination |
| `FixedTeleportsTarget.vue` | Portal for fixed elements |

### `work/`

| Component | Purpose |
|-----------|---------|
| `WorkArticleContent.vue` | Case study content |
| `WorkNumbers.vue` | Case study numeric metrics |
| `WorkCenteredStat.vue` | Centered statistic |
| `WorkCTAButton.vue` | Case study CTA button |

### `webflow/` (Webflow Enterprise landing)

| Component | Purpose |
|-----------|---------|
| `Hero.vue` | Webflow page hero |
| `HeroCenterLine.vue` | Decorative line |
| `Services.vue` | Services |
| `CasesSwiper.vue` | Case studies swiper |
| `ClientsSaySwiper.vue` | Client testimonials swiper |
| `VideoReel.vue` | Video reel (desktop) |
| `VideoReelMobile.vue` | Video reel (mobile) |
| `Statistics.vue` | Statistics |
| `Timeline.vue` | Timeline |
| `WatsUs.vue` | “What's us” section |

### `contact/`

| Component | Purpose |
|-----------|---------|
| `ContactForm.vue` | Main form container (439 lines) |
| `ContactDescriptionForm.vue` | Step — project description |
| `ContactNameForm.vue` | Step — name |
| `ContactRoleForm.vue` | Step — role |
| `ContactDateForm.vue` | Step — date |
| `Contact*Button` (×4) | Goal, budget, timeline, join buttons |

### `ui/` (39 components)

Key components:

| Component | Purpose |
|-----------|---------|
| `VideoPlayerModal.vue` | Modal video player |
| `VideoPreview.vue` | Video preview |
| `LetsTalkScene.vue` | “Let's Talk” 3D scene (Three.js) |
| `LetsTalkSceneTest.vue` | Test scene variant |
| `ArticleContent.vue` | Rich text article content |
| `ArticleList.vue` | Article list |
| `NewsCard.vue` | News card |
| `ClickCursor.vue` | Custom cursor |
| `Loader.vue` | Global preloader |
| `HeaderNavigationButton.vue` | Header button (364 lines) |
| `Accordion.vue` | Accordion |
| `SoundButton.vue` | Sound toggle |
| `SoundButton_old.vue` | ⚠️ Legacy file |
| `ClickCursor copy.vue` | ⚠️ Duplicate cursor |

---

## 7. Composables

| File | Purpose |
|------|---------|
| `useAudioManager.js` | Howler-based audio; UI interactions |
| `useContact.js` | Multi-step form logic; “agent” animation; Formspree submission |
| `useCursor.js` | Cursor position tracking (`@vueuse/usePointer`) |
| `useHeader.js` | Header state (visibility, mode, etc.) |
| `useHomeVideoPlayerMobile.js` | Mobile hero video player |
| `useLoader.js` | Global preloader (GSAP timeline) |
| `useNavigation.js` | Navigation and layout state |
| `useScrollSmoother.js` | Lenis init + GSAP integration |
| `useVideoPlayer.js` | Modal player, Video.js/Mux, preview reel (348 lines) |
| `useWorks.js` | Work / case study data and logic |

---

## 8. Utilities & Animations

### `app/utils/animations/`

Each file owns GSAP animations for one page:

| File | Page |
|------|------|
| `homepage.js` | Homepage |
| `about.js` | About |
| `services.js` | Services |
| `contact.js` | Contact |
| `webflow.js` | Webflow Enterprise |
| `transitions.js` | Page transitions (between routes) |

### `app/utils/glsl/`

| File | Type | Where it is used |
|------|------|------------------|
| `main.vert` | Vertex shader | Three.js scene |
| `main.frag` | Fragment shader | Three.js scene |

### `app/utils/`

| File | Functions |
|------|-----------|
| `index.js` | Re-exports from `animations/homepage` |
| `comput.js` | `calculateReadingTime(text)` |
| `formaters.js` | `formatDate(dateString)` |

---

## 9. Data Layer

Static data in `app/data/` (JS modules, not CMS):

| File | Contents |
|------|----------|
| `navigationData` | Menu items, navigation structure |
| `footerData` | Footer links and content |
| `worksData` | Case list (may serve as static fallback) |
| `servicesData` | Services list |
| `teamData` | Team members |
| `clientsData` | Client list |
| `partnersData` | Partner list |
| `newsData` | News list (static) |
| `awardsData` | Awards list |
| `contactData` | Form options (goals, budgets, roles, etc.) |

---

## 10. API Integrations

### Strapi CMS

- **Base URL:** `NUXT_PUBLIC_STRAPI_BASE_URL` (production: separate server)
- **Auth:** `Authorization: Bearer ${strapiApiKey}`
- **Query builder:** `qs` (populate, filters, pagination)

**Endpoints:**

| Endpoint | Page |
|----------|------|
| `GET /api/homepage` | Homepage |
| `GET /api/articles` | Content Hub list |
| `GET /api/articles?filters[slug][$eq]=:slug` | Article |
| `GET /api/works` | Work list |
| `GET /api/works?filters[slug][$eq]=:slug` | Case study |
| Webflow single type | Webflow Enterprise page |

**Preview flow:**
1. Strapi calls `GET /api/preview?secret=XXX&type=article&slug=YYY`
2. Nitro handler (`server/api/preview.get.ts`) validates `secret`
3. Redirect 307 → `/preview/content-hub/:slug?status=draft`
4. Preview page fetches the draft using the `status` parameter

### Formspree

- **Endpoint:** `https://formspree.io/f/xeeranzd`
- **Usage:** `useContact.js` — contact form submission
- **Method:** `$fetch` (POST, JSON)

### Mux Video

- **Integration:** `@mux/videojs-kit` + custom element `<mux-player>`
- **Components:** `VideoPlayerModal.vue`, `VideoPreview.vue`, `VideoReel.vue`
- **Registration:** `isCustomElement: (tag) => tag === 'mux-player'` in `nuxt.config.ts`

---

## 11. Assets & Fonts

### Fonts

| File | Style | Preload |
|------|-------|---------|
| `RoobertTRIAL-Regular.otf` | Regular | ✅ |
| `RoobertMonoTRIAL-Medium.otf` | Mono Medium | ✅ |

Location: `/public/fonts/`

### Favicon

| File | Type |
|------|------|
| `/favicon.gif` | Animated GIF (shortcut icon) |
| `/favicon-256x256.gif` | Apple touch icon |

### Video

Static video files: `/public/video/` — used in layout and hero sections via `$fetch` blob.

### SVG

Handled by `nuxt-svgo` — SVG files import as Vue components.

---

## 12. SEO & Meta

| Parameter | Value |
|-----------|-------|
| `<title>` | `Psychoactive Studios \| Web Design Agency \| Webflow Partner` |
| `description` | Award-Winning Multidisciplinary Digital Experience Agency... |
| `og:image` | `/og.png` (1200×631) |
| `og:type` | `website` |
| `twitter:card` | `summary_large_image` |
| `viewport` | `width=device-width,minimum-scale=1.0,maximum-scale=1.0` (zoom disabled) |

Each page, case study, and article should override meta via `useHead()` or `useSeoMeta()`.

---

## 13. Dev Commands

```bash
# Start dev server
npm run dev

# Production build (SSR)
npm run build

# Static generation (SSG)
npm run generate

# Preview production build
npm run preview

# Nuxt prepare (postinstall)
npm run postinstall
```

### Environment variables for local development

Create `.env` in the project root:

```env
NUXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_KEY=your_strapi_api_key
NUXT_PUBLIC_SITE_URL=http://localhost:3000
STRAPI_PREVIEW_SECRET=your_preview_secret
STRAPI_PREVIEW_URL=http://localhost:3000
```

---

*Document generated from codebase analysis. Last updated: March 2026.*
