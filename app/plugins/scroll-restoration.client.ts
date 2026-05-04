// Disables browser scroll restoration so refresh / back-forward
// always lands the page at the top instead of wherever the user
// was last scrolled to. Runs as a Nuxt client plugin so it
// executes before any page component mounts — earlier than the
// onBeforeMount / script-setup approach in app.vue, which was too
// late on Chromium browsers (the browser had already restored
// scroll by then).
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Force the document to scroll position 0 immediately and again
  // once the browser fires its own load event (covers the rare case
  // where a browser restores scroll AFTER plugins run).
  window.scrollTo(0, 0);
  window.addEventListener(
    'load',
    () => {
      window.scrollTo(0, 0);
    },
    { once: true }
  );
});
