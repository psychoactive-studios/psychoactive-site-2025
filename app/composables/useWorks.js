import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import useScrollSmoother from '~/composables/useScrollSmoother';

export const currentTransitionImage = ref(null);

export default function useWorks() {
  const router = useRouter();
  const { enableScroll, scrollSmoother } = useScrollSmoother();

  const workPageInit = async () => {
    console.log('workPageInit!!!');

    setTimeout(() => {
      const layoutElements = gsap.utils.toArray([
        '#header-logo',
        '#header-navigation-button',
        '#header-sound-button',
      ]);
      gsap.to(layoutElements, {
        scale: 1,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
      });
      gsap.timeline().set('#work-scroll-progress', { display: 'block' }).fromTo(
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

  async function footerTextAnimationInit(ctx, footer) {
    SplitText.create(footer, {
      type: 'words,chars',
      charsClass: 'char-center',
    });

    await nextTick();

    ctx.add(() => {
      gsap.to(footer.querySelectorAll('.char-center'), {
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom',
          end: () =>
            document
              .querySelector('.work__footer_scroll')
              .getBoundingClientRect().top,
          scrub: true,
          invalidateOnRefresh: true,
          onLeave: () => {
            router.push('/work');
          },
        },
        opacity: 1,
        duration: 0.1,
        stagger: 0.05,
      });
    });
  }

  return {
    currentTransitionImage,
    workPageInit,
    footerTextAnimationInit,
  };
}
