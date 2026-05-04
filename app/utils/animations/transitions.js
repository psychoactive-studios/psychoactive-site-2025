import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useAudioManager from '~/composables/useAudioManager';
import useNavigation from '~/composables/useNavigation';

/**
 * Page transition out when the navigation came from the hamburger menu.
 *
 * Three things this helper does:
 *
 * 1. Hide the outgoing page synchronously (direct style mutation, no
 *    GSAP frame delay). Belt-and-braces with the nav-transition
 *    cover — covers the brief frame between click and onLeave.
 *
 * 2. Wait for the actual `close-timeline` to finish before signalling
 *    the route transition complete. Polls (rather than checking once)
 *    so we catch the close-timeline whether it started immediately
 *    after the click (menu was fully open) OR after the open-timeline
 *    completes (mid-open click — the click handler queues the close).
 *
 * 3. Fade the nav-transition cover back out once the new page has
 *    mounted, so the user smoothly sees the new page rather than a
 *    sudden cut from black.
 */
export const navTransitionOut = (el, done, options = {}) => {
  // Hide the outgoing page underneath the menu/cover — synchronous so
  // there's no frame where it's visible. About to be unmounted; no
  // need to restore.
  if (el && el.style) el.style.opacity = '0';

  // Pages with overlay/pinned content (services stepper, work scroll
  // progress widget, etc.) can pass `options.alsoHide` to hide their
  // extras at the same instant the page el goes invisible.
  if (typeof options.alsoHide === 'function') {
    options.alsoHide();
  }

  const { transitionFromNavigation, hideNavTransitionCover } = useNavigation();

  const finish = () => {
    // Pages can pass `options.onComplete` for side effects that need
    // to fire AFTER the close timeline finishes (e.g. resetting the
    // colour mode flag, clearing back-button state, etc.).
    if (typeof options.onComplete === 'function') options.onComplete();
    transitionFromNavigation.value = false;
    done();
    // Fade the cover out a beat after `done()` so the new page has
    // a chance to mount underneath before the cover reveals it.
    hideNavTransitionCover();
  };

  const hookCloseOnComplete = (close) => {
    // Capture and restore any existing onComplete so the close
    // timeline's own end-of-animation logic (initNavigation) still
    // fires.
    const existing = close.eventCallback('onComplete');
    close.eventCallback('onComplete', () => {
      if (typeof existing === 'function') existing();
      close.eventCallback('onComplete', existing || null);
      finish();
    });
  };

  // Poll for close-timeline to become active. Covers two cases:
  //   - Click while menu fully open: close starts almost immediately
  //     (we usually catch it on the first attempt).
  //   - Click during open animation: the click handler queues the
  //     header-button click on open's onComplete. close-timeline only
  //     starts once open finishes — which can be up to ~1s later.
  // Budget: 2s (~120 frames at 60fps). If close still hasn't started
  // after that, finish anyway so navigation isn't stuck forever.
  const POLL_BUDGET_FRAMES = 120;
  const waitForClose = (attempts = 0) => {
    const close = gsap.getById('close-timeline');
    if (close?.isActive()) {
      hookCloseOnComplete(close);
      return;
    }
    // If we have a close-timeline reference and it's already done,
    // there's nothing left to wait for.
    if (close && close.progress() === 1) {
      finish();
      return;
    }
    if (attempts < POLL_BUDGET_FRAMES) {
      requestAnimationFrame(() => waitForClose(attempts + 1));
      return;
    }
    finish();
  };

  waitForClose();
};

export const leaveAnimation = (el, done) => {
  const { scrollSmoother } = useScrollSmoother();
  const { playInteractionSound } = useAudioManager();

  const router = useRouter();
  const targetPath = router.currentRoute.value.path;
  const isInnerWorkPage =
    targetPath.startsWith('/work/') && targetPath !== '/work';

  if (!isInnerWorkPage) {
    playInteractionSound('menu-close');
  }

  scrollSmoother.value.stop();
  const originCenter = scrollSmoother.value.scroll + window.innerHeight / 2;

  gsap
    .timeline()
    .set(el, { transformOrigin: `center ${originCenter}px` })
    .to(el, {
      scale: 0.6,
      duration: 1,
      ease: 'power2.in',
    })
    .to(
      el,
      {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
      },
      '<'
    )
    .add(() => done(), '<+=0.9');
};
