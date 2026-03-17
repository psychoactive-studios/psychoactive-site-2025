import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useAudioManager from '~/composables/useAudioManager';

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
