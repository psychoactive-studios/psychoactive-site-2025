# Psychoactive Studios — Website

> **[psychoactive.co.nz](https://psychoactive.co.nz)**  
> Award-winning multidisciplinary digital experience agency, New Zealand.

Premium marketing site built with Nuxt 4, featuring GSAP animations, Three.js 3D scenes, Mux video, smooth scroll (Lenis), and Strapi CMS.

---

## Requirements

- **Node.js** ≥ 20
- **npm** ≥ 10
- Access to a running **Strapi** instance (local or remote)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example below into a `.env` file in the project root:

```env
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_KEY=your_strapi_api_key
STRAPI_PREVIEW_SECRET=your_preview_secret
STRAPI_PREVIEW_URL=http://localhost:3000
```

### 3. Start the dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run generate` | **Primary production build** — generates static site (SSG) |
| `npm run build` | SSR / Nitro server bundle (Node deploy only) |
| `npm run preview` | Preview the generated / built output locally |
| `npm run postinstall` | Nuxt prepare (runs automatically after install) |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Nuxt 4 + Vue 3 |
| Rendering | SSG (`nuxt generate`) + Nitro prerender |
| Styles | SCSS |
| Animations | GSAP (ScrollTrigger, SplitText) |
| Smooth scroll | Lenis |
| 3D / WebGL | Three.js + GLSL shaders |
| Video | Mux (`@mux/videojs-kit`) |
| Audio | Howler |
| CMS | Strapi v4 (REST API) |
| Forms | vee-validate + Formspree |
| Images | @nuxt/image (ipx) |
| SVG | nuxt-svgo |

---

## Project Structure

```
app/
├── pages/          # File-based routes
├── components/     # UI components (96 files across 8 folders)
├── composables/    # Shared logic (audio, scroll, video, contact form…)
├── utils/
│   ├── animations/ # GSAP timelines per page
│   └── glsl/       # Vertex + fragment shaders
├── data/           # Static JS data (nav, team, awards, clients…)
├── plugins/        # Client-only plugins (GSAP, Vue3Marquee)
└── assets/styles/  # Global SCSS

server/api/
└── preview.get.ts  # Strapi draft-preview endpoint

public/
├── fonts/          # Roobert TRIAL (Regular + Mono Medium)
└── video/          # Static video assets
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/about` | About the agency |
| `/services` | Services |
| `/work` | Case studies list |
| `/work/:slug` | Individual case study |
| `/content-hub` | Blog / Content Hub list |
| `/content-hub/:slug` | Article |
| `/contact` | Multi-step contact form |
| `/webflow-enterprise-agency` | Webflow Enterprise landing |
| `/preview/content-hub/:slug` | Strapi draft preview — article |
| `/preview/work/:slug` | Strapi draft preview — case study |

---

## Strapi CMS

The site consumes content from a Strapi v4 REST API.

**Endpoints used:**

```
GET /api/homepage
GET /api/works
GET /api/works?filters[slug][$eq]=:slug
GET /api/articles
GET /api/articles?filters[slug][$eq]=:slug
```

**Draft preview flow:**

1. Strapi calls `GET /api/preview?secret=XXX&type=article&slug=YYY`
2. The Nitro handler (`server/api/preview.get.ts`) validates the secret
3. Redirects to `/preview/content-hub/:slug?status=draft`
4. The preview page fetches the draft content

---

## Deployment

The site deploys as a **fully static output** produced by:

```bash
npm run generate
```

The output directory (`.output/public`) contains pure HTML, JS, and assets — deployable to any static host (Netlify, Vercel, Cloudflare Pages, S3, etc.).

---

## Further Reading

- [`SPEC.md`](./SPEC.md) — full developer specification (components, composables, API details, known issues)
- [Nuxt docs](https://nuxt.com/docs)
- [Strapi docs](https://docs.strapi.io)
