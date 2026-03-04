import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useHeader from '~/composables/useHeader';
import useNavigation from './useNavigation';

export const currentTransitionImage = ref(null);

export default function useWorks() {
  const router = useRouter();
  const { enableScroll, scrollSmoother } = useScrollSmoother();
  const { backButtonHref } = useNavigation();

  const workPageInit = async () => {
    const scrollDownText = SplitText.create('#work-scroll-down-text', {
      type: 'chars',
      charsClass: 'char-center',
    }).chars;

    //

    backButtonHref.value = 'work';
    setTimeout(() => {
      // Animate layout elements back in
      const layoutElements = gsap.utils.toArray([
        '#header-logo',
        '#header-navigation-button',
        '#header-sound-button',
        '#top-back-button',
      ]);
      gsap
        .timeline()
        .set('#top-back-button', { display: 'flex' })
        .to(layoutElements, {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: 'power3.out',
        });

      gsap
        .timeline()
        .set('#work-scroll-progress', { display: 'block' })
        .fromTo(
          '#work-scroll-progress',
          {
            scale: 0,
          },
          {
            scale: 1,
            // opacity: 0,
            duration: 0.75,
            ease: 'power3.out',
          }
        )
        .to(
          scrollDownText,
          {
            duration: 2.3,
            scrambleText: {
              text: '{original}',
              chars: 'uppercase',
              tweenLength: false,
            },
          },
          '<+=0.2'
        )
        .to(
          scrollDownText,
          {
            opacity: 1,
            duration: 0.01,
            stagger: {
              amount: 0.9,
              from: 'random',
            },
          },
          '<'
        )
        .fromTo(
          '#work-scroll-down-button .dots-arrow__icon_dot',
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            stagger: { each: 0.05, from: 'random' },
            ease: "rough({ template: power1.out, strength: 5, points: 20, taper: 'none', randomize: true, clamp: false})",
          },
          '<'
        );

      scrollSmoother.value.scrollTo(0, {
        immediate: true,
        lock: true,
        force: true,
      });
      currentTransitionImage.value = null;
      enableScroll();
    }, 100);
  };

  function footerTextAnimationInit(ctx, footer) {
    const { mode } = useHeader();

    ctx.add(() => {
      gsap.to(footer.querySelectorAll('.work__footer_scroll--progress img'), {
        scrollTrigger: {
          trigger: footer,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onEnter: () => {
            mode.value = 'light';
          },
          onLeaveBack: () => {
            mode.value = 'dark';
          },
        },
        opacity: 1,
        duration: 0.1,
        stagger: 0.05,
        onComplete: () => {
          router.push('/work');
        },
      });
    });
  }

  return {
    currentTransitionImage,
    workPageInit,
    footerTextAnimationInit,
  };
}
