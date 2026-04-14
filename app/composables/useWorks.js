import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import useScrollSmoother from '~/composables/useScrollSmoother';
import useHeader from '~/composables/useHeader';
import useNavigation from './useNavigation';
import { useMediaQuery } from '@vueuse/core';

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

    const isMobile = useMediaQuery('(max-width: 768px)');    

    backButtonHref.value = 'work';

    if (isMobile.value) {
      const mobileLayoutElements = gsap.utils.toArray([
        '.work__header--mobile .work__hero_sub-title',
        '.work__header--mobile .work__hero_info',
        '.work__header--mobile .work__hero_link',
        '.work__header--mobile .work__hero_description',
      ]);

      gsap.timeline()
        .from('.work__illustration_bg', {
          y: '100vh',
          duration: 1,
          ease: 'power4.out',
        })
        .from('.work__illustration img', {
          y: '100vh',
          duration: 1,
          ease: 'power4.out',
        }, '<0.3')
        .from(
          ['.work__hero_title', '.work__hero_sub-title'],
          {
            y: '100vh',
            duration: 1,
            ease: 'power4.out',
            stagger: 0.1,
          },
          '<0.2'
        )
        .from(
          mobileLayoutElements,
          {
            // scale: 1,
            opacity: 0,
            duration: 0.75,
            ease: 'power3.out',
          },
          '<0.5'
        )
        .to('#header-navigation-mobile', {
          yPercent: 0,
          duration: 1,
          ease: 'power3.out',
        }, '<0.5')
        .from('.work__header--mobile .work__back_button', {
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        }, '<')
        .set('.work', { backgroundColor: '#fff' });
      scrollSmoother.value.scrollTo(0, {
        immediate: true,
        lock: true,
        force: true,
      });
      currentTransitionImage.value = null;
      enableScroll();
    }else{
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
          .set('.work', { backgroundColor: '#fff' })
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
          )

        scrollSmoother.value.scrollTo(0, {
          immediate: true,
          lock: true,
          force: true,
        });
        currentTransitionImage.value = null;
        enableScroll();
      }, 100);
    }
  };

  function footerTextAnimationInit(ctx, footer) {
    const { mode } = useHeader();
    let tween = null;
    ctx.add(() => {
      tween = gsap.to(footer.querySelectorAll('.work__footer_scroll--progress img'), {
        scrollTrigger: {
          trigger: footer,
          start: 'top top',
          end: 'bottom 1%',
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
        onUpdate: () => {
          if (tween?.progress() > 0.95) router.push('/work');
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
