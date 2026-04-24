// Vercel Web Analytics — client-only.
//
// @vercel/analytics doesn't auto-register as a Nuxt module on v1.5+, so
// we inject the tracker manually via a `.client.js` plugin (the suffix
// tells Nuxt to only run this in the browser). Vercel's `inject()`
// function adds the analytics script to the page and starts recording
// page views, referrers, countries, and devices.
//
// Only active on deployed environments (production + Vercel previews).
// `npm run dev` won't show up in the dashboard — by design.

import { inject } from '@vercel/analytics';

export default defineNuxtPlugin(() => {
  inject();
});
