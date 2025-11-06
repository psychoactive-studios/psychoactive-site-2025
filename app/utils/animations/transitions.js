import gsap from 'gsap';
import useScrollSmoother from '~/composables/useScrollSmoother';
const { scrollSmoother } = useScrollSmoother();

export const leaveAnimation = (el, done) => {
  scrollSmoother.value.paused(true);
  const originCenter =
    scrollSmoother.value.scrollTop() + window.innerHeight / 2;

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
      done();
    }, '<+=0.9');
};
