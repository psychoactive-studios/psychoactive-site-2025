import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useAudioManager from '~/composables/useAudioManager';
import useNavigation from '~/composables/useNavigation';

/**
 * Page transition out when the navigation came from the hamburger menu.
 *
 * Two things this helper does that the previous inline implementation
 * didn't:
 *
 * 1. Hide the outgoing page synchronously (direct style mutation, no
 *    GSAP frame delay). Eliminates the brief moment where the old
 *    page was visible behind the menu as it started lifting.
 *
 * 2. Wait for the actual `close-timeline` to finish before signalling
 *    the route transition complete. The previous fixed `+=1s` wait
 *    could desync from the real close animation — sometimes the new
 *    page appeared mid-close, sometimes left a black gap. Hooking
 *    onComplete syncs the page swap to the menu's actual end-of-close.
 *
 * If close didn't start (user clicked a link during the open
 * animation, which closeNavigation guards against), we fall back to a
 * generous timeout so navigation still completes.
 */
export const navTransitionOut = (el, done, options = {}) => {
  // Hide the outgoing page underneath the menu — synchronous so there
  // is no possibility of a frame where it's visible behind the lifting
  // menu. The page is about to be unmounted; no need to restore.
  if (el && el.style) el.style.opacity = '0';

  // Pages with overlay/pinned content (services stepper, work scroll
  // progress widget, etc.) can pass `options.alsoHide` to hide their
  // extras at the same instant the page el goes invisible. These DOM
  // mutations fire synchronously alongside the opacity drop.
  if (typeof options.alsoHide === 'function') {
    options.alsoHide();
  }

  const finish = () => {
    // Pages can pass `options.onComplete` for side effects that need
    // to fire AFTER the close timeline finishes (e.g. resetting the
    // colour mode flag, clearing back-button state, etc.) — alongside
    // the standard transitionFromNavigation reset.
    if (typeof options.onComplete === 'function') options.onComplete();
    const { transitionFromNavigation } = useNavigation();
    transitionFromNavigation.value = false;
    done();
  };

  const close = gsap.getById('close-timeline');

  if (close && close.isActive()) {
    // Capture and restore any existing onComplete so the close
    // timeline's own end-of-animation logic (initNavigation) still
    // fires.
    const existing = close.eventCallback('onComplete');
    close.eventCallback('onComplete', () => {
      if (typeof existing === 'function') existing();
      // Clear our hook so the next close cycle doesn't re-trigger it.
      close.eventCallback('onComplete', existing || null);
      finish();
    });
  } else {
    // Close didn't start (e.g. user clicked during open animation,
    // when closeNavigation early-returns). Use a fallback delay so the
    // outgoing page gets a beat before the next one mounts.
    setTimeout(finish, 1000);
  }
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
