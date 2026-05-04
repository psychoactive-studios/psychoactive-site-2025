// Force every page load (refresh, navigation, BFCache restore) to
// land at the top of the page, regardless of where the user was
// scrolled before.
//
// Why this needs three separate hooks:
//
//   1. `history.scrollRestoration = 'manual'` — tells the browser
//      not to restore the previous scroll position on refresh.
//      Setting it as early as possible (in this plugin, before the
//      app mounts) gets in before the browser starts restoring.
//
//   2. `window.scrollTo(0, 0)` immediately + on the 'load' event
//      — belt-and-braces for browsers that ignore or are slow to
//      apply scrollRestoration.
//
//   3. `pageshow` listener — handles the back-forward cache
//      (BFCache). When a user navigates away and comes back, some
//      browsers (Safari especially) restore the page from BFCache
//      with the previous scroll position, completely bypassing
//      page-load handlers. The pageshow event fires in this case
//      with `event.persisted === true`.
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const scrollTop = () => window.scrollTo(0, 0);

  scrollTop();
  window.addEventListener('load', scrollTop, { once: true });
  window.addEventListener('pageshow', scrollTop);
});
