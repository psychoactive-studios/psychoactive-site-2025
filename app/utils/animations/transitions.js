import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';

export const leaveAnimation = (el, done) => {
  const { scrollSmoother } = useScrollSmoother();
  scrollSmoother.value.stop();
  const originCenter = scrollSmoother.value.scroll + window.innerHeight / 2;

  gsap
    .timeline()
    .set(el, { transformOrigin: `center ${originCenter}px` })
    .to(el, {
      scale: 0,
      duration: 1,
      ease: 'power4.in',
    })
    .to(
      el,
      {
        opacity: 0,
        duration: 0.8,
        ease: 'power4.in',
      },
      '<'
    )
    .add(() => {
      scrollSmoother.value.stop();
      done();
    }, '<+=0.9');
};
